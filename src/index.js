import 'dotenv/config';
import logger from './utils/logger.js';
import { startApiServer } from './api/server.js';
import { agentManager } from './core/agent-manager.js';
import { supabase } from './config/supabase-client.js';

const loadAgentsFromDb = async () => {
  logger.info('Loading agent configurations from Supabase...');
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logger.error(error, 'Failed to fetch agents from Supabase.');
    throw error;
  }
  
  // Map database columns to the format expected by WhatsappClient
  const agentConfigs = data.map(agent => ({
    id: agent.id,
    ownerName: agent.owner_name,
    assistantName: agent.assistant_name,
    phoneNumber: agent.phone_number,
    llmProvider: agent.llm_provider,
    systemPrompt: agent.custom_prompt,
    userId: agent.user_id, // Pass user_id for context
  }));

  logger.info(`Loaded ${agentConfigs.length} active agents from DB.`);
  return agentConfigs;
};


const main = async () => {
  logger.info('Starting WhatsApp AI SaaS Platform...');

  // 1. Load agent configurations from the database
  const agentConfigs = await loadAgentsFromDb();
  if (agentConfigs.length === 0) {
    logger.warn('No active agents found in the database.');
  }
  
  // 2. Initialize and start all enabled agents
  try {
    await agentManager.initialize(agentConfigs);
    logger.info(`Initialized ${agentManager.getAgents().length} agents.`);
  } catch (error) {
    logger.error(error, 'Failed to initialize agent manager.');
    process.exit(1);
  }

  // 3. Start the API server for the dashboard
  const port = process.env.PORT || 3001;
  startApiServer(port);
};

main().catch(err => {
  logger.error(err, 'Unhandled error at startup.');
  process.exit(1);
});