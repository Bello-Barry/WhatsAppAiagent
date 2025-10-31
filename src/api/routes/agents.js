import { Router } from 'express';
import { agentManager } from '../../core/agent-manager.js';
import logger from '../../utils/logger.js';
import { supabase } from '../../core/supabase-client.js';


const router = Router();

// This route is less critical now as the frontend can fetch from supabase directly.
// It can be used for admin purposes or for data that isn't in the DB.
router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('agents').select('*');
    if (error) {
        logger.error(error);
        return res.status(500).json({ error: 'Failed to fetch agents' });
    }
    res.status(200).json(data);
});

// This can be used to check the live status from the agent manager instance
router.get('/:agentId/status', (req, res) => {
  const { agentId } = req.params;
  const agent = agentManager.getAgent(agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found or not running' });
  }

  res.status(200).json({
      id: agent.id,
      status: agent.status,
      qr: agent.qr
  });
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


export default router;