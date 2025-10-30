import { Router } from 'express';
import { agentManager } from '../../core/agent-manager.js';
import { memoryManager } from '../../ai/memory-manager.js';
import logger from '../../utils/logger.js';

const router = Router();

// Helper to format agent data for the frontend
const formatAgentData = (agent) => ({
  id: agent.id,
  user_id: 'user-01', // Mocked user_id
  phone_number: agent.config.phoneNumber,
  owner_name: agent.config.ownerName,
  assistant_name: agent.config.assistantName,
  llm_provider: agent.config.llmProvider,
  custom_prompt: agent.config.systemPrompt,
  is_active: agent.status === 'CONNECTED',
  created_at: new Date().toISOString(), // Mocked creation date
});

// GET /api/agents - List all agents
router.get('/', (req, res) => {
  const agents = agentManager.getAgents();
  const formattedAgents = agents.map(formatAgentData);
  res.status(200).json(formattedAgents);
});

// GET /api/agents/:id - Get a single agent
router.get('/:agentId', (req, res) => {
  const { agentId } = req.params;
  const agent = agentManager.getAgent(agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.status(200).json(formatAgentData(agent));
});

// PUT /api/agents/:id - Update an agent's config (in-memory)
router.put('/:agentId', (req, res) => {
    const { agentId } = req.params;
    const agent = agentManager.getAgent(agentId);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    // Update the in-memory config
    agent.config.ownerName = req.body.owner_name || agent.config.ownerName;
    agent.config.assistantName = req.body.assistant_name || agent.config.assistantName;
    agent.config.llmProvider = req.body.llm_provider || agent.config.llmProvider;
    agent.config.systemPrompt = req.body.custom_prompt || agent.config.systemPrompt;
    
    logger.info(`Updated config for agent ${agentId}`);
    
    res.status(200).json(formatAgentData(agent));
});


// GET /api/agents/:id/stats - Get mocked stats for an agent
router.get('/:agentId/stats', (req, res) => {
  const { agentId } = req.params;
   if (!agentManager.getAgent(agentId)) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Generate mock stats for the last 7 days
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    stats.push({
      date: date.toISOString().split('T')[0],
      messages_sent: Math.floor(Math.random() * (70 - 20 + 1)) + 20,
      messages_received: Math.floor(Math.random() * (60 - 15 + 1)) + 15,
      avg_response_time_ms: Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200,
    });
  }
  res.status(200).json(stats);
});

// GET /api/agents/:id/conversations - Get conversation history
router.get('/:agentId/conversations', (req, res) => {
    const { agentId } = req.params;
    if (!agentManager.getAgent(agentId)) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    const conversations = [];
    // The memory manager keys are like 'agentId-contactJid'
    for (const [key, messages] of memoryManager.conversations.entries()) {
        if (key.startsWith(agentId)) {
            const contact_number = key.split('-')[1].split('@')[0]; // Extract phone number from JID
            const formattedMessages = messages.map((msg, index) => ({
                sender: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
                timestamp: new Date(Date.now() - (messages.length - index) * 60000).toISOString(), // Mock timestamp
            }));
            
            if(formattedMessages.length > 0) {
                 conversations.push({
                    id: key,
                    agent_id: agentId,
                    contact_number: `+${contact_number}`,
                    messages: formattedMessages,
                    last_message_at: formattedMessages[formattedMessages.length - 1].timestamp,
                });
            }
        }
    }
    
    // Create a mock conversation if none exist for demonstration
    if (conversations.length === 0) {
        const mockTimestamp = new Date().toISOString();
        conversations.push({
            id: `${agentId}-mock12345@s.whatsapp.net`,
            agent_id: agentId,
            contact_number: '+1234567890',
            messages: [
                { sender: 'user', content: 'Hello, are you there?', timestamp: mockTimestamp },
                { sender: 'assistant', content: 'Hi! I am here. How can I help you today?', timestamp: mockTimestamp },
            ],
            last_message_at: mockTimestamp,
        });
    }

    res.status(200).json(conversations);
});

export default router;
