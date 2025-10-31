import 'dotenv/config';
import logger from './utils/logger.js';
import { startApiServer } from './api/server.js';
import { agentManager } from './core/agent-manager.js';
import { supabase } from './core/supabase-client.js';

const main = async () => {
  logger.info('Starting WhatsApp AI SaaS Platform...');

  // 1. Load agent configurations from Supabase
  const { data: agentConfigs, error } = await supabase
    .from('agents')
    .select('*');

  if (error) {
      logger.error(error, 'Failed to fetch agent configurations from Supabase.');
      process.exit(1);
  }

  if (!agentConfigs || agentConfigs.length === 0) {
    logger.warn('No agents configured in the database.');
  }
  
  // 2. Initialize and start all agents
  try {
    // We pass the raw config from Supabase to the manager
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