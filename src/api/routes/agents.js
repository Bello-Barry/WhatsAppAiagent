import { Router } from 'express';
import { agentManager } from '../../core/agent-manager.js';
import logger from '../../utils/logger.js';
import { supabase } from '../../config/supabase-client.js';

const router = Router();

// Helper to format agent data for the frontend, combining DB data with live status
const formatAgentForAPI = async (agentFromDb) => {
    const liveAgent = agentManager.getAgent(agentFromDb.id);
    return {
        ...agentFromDb,
        is_active: liveAgent ? liveAgent.status === 'CONNECTED' : false,
        phone_number: liveAgent?.getJid()?.split('@')[0] || agentFromDb.phone_number,
    };
};

// GET /api/agents - List all agents for the authenticated user
router.get('/', async (req, res) => {
    const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', req.user.id);
    
    if (error) {
        logger.error(error, 'Failed to fetch agents for user');
        return res.status(500).json({ error: 'Could not fetch agents' });
    }

    const formattedAgents = await Promise.all(agents.map(formatAgentForAPI));
    res.json(formattedAgents);
});

// GET /api/agents/:agentId - Get a single agent's details
router.get('/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('user_id', req.user.id)
        .single();

    if (error || !agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(await formatAgentForAPI(agent));
});

// PUT /api/agents/:agentId - Update an agent
router.put('/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { owner_name, assistant_name, llm_provider, custom_prompt } = req.body;
    
    const { data, error } = await supabase
        .from('agents')
        .update({ owner_name, assistant_name, llm_provider, custom_prompt })
        .eq('id', agentId)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error || !data) {
        logger.error(error, 'Failed to update agent');
        return res.status(404).json({ error: 'Agent not found or update failed' });
    }

    // Also update the live agent's config in memory
    const liveAgent = agentManager.getAgent(agentId);
    if (liveAgent) {
        liveAgent.config.ownerName = data.owner_name;
        liveAgent.config.assistantName = data.assistant_name;
        liveAgent.config.llmProvider = data.llm_provider;
        liveAgent.config.systemPrompt = data.custom_prompt;
        logger.info(`Updated live config for agent ${agentId}`);
    }

    res.json(await formatAgentForAPI(data));
});

// GET /api/agents/:agentId/conversations
router.get('/:agentId/conversations', async (req, res) => {
    const { agentId } = req.params;
    // First, verify the user owns the agent
    const { count, error: agentError } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('id', agentId)
        .eq('user_id', req.user.id);
    
    if (agentError || count === 0) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    // Fetch conversations for that agent
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('agent_id', agentId);
    
    if (error) {
        logger.error(error, 'Failed to fetch conversations');
        return res.status(500).json({ error: 'Could not fetch conversations' });
    }
    res.json(data);
});

// GET /api/agents/:agentId/stats
router.get('/:agentId/stats', (req, res) => {
    res.json([]);
});

// GET /api/agents/:agentId/tools
router.get('/:agentId/tools', (req, res) => {
    res.json([]);
});

export default router;