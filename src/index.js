import 'dotenv/config';
import logger from './utils/logger.js';
import { startApiServer } from './api/server.js';
import { agentManager } from './core/agent-manager.js';
import { loadAgentsFromEnv } from './config/env-loader.js';

const main = async () => {
  logger.info('Starting WhatsApp AI SaaS Platform...');

  // 1. Load agent configurations from environment variables
  const agentConfigs = loadAgentsFromEnv();
  if (agentConfigs.length === 0) {
    logger.warn('No agents configured. Please check your .env file.');
    // return; // We can still start the API server without agents
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
