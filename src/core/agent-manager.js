import { WhatsappClient } from './whatsapp-client.js';
import logger from '../utils/logger.js';

class AgentManager {
  constructor() {
    this.agents = new Map();
  }

  /**
   * Initializes the manager with agent configurations and starts each agent.
   * @param {Array<object>} agentConfigs - Array of agent configuration objects.
   */
  async initialize(agentConfigs) {
    for (const config of agentConfigs) {
      const agent = new WhatsappClient(config);
      this.agents.set(config.id, agent);
    }
    
    // Start all agents concurrently
    const startPromises = Array.from(this.agents.values()).map(agent => agent.start());
    await Promise.all(startPromises);
  }

  /**
   * Retrieves an agent instance by its ID.
   * @param {string} agentId - The ID of the agent.
   * @returns {WhatsappClient|undefined}
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Retrieves all agent instances.
   * @returns {Array<WhatsappClient>}
   */
  getAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Gracefully stops all agents.
   */
  async stopAll() {
    logger.info('Stopping all agents...');
    const stopPromises = Array.from(this.agents.values()).map(agent => agent.stop());
    await Promise.all(stopPromises);
    logger.info('All agents have been stopped.');
  }
}

// Singleton instance
export const agentManager = new AgentManager();
