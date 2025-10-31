import logger from '../utils/logger.js';

/**
 * Loads and parses agent configurations from environment variables.
 * Agents are expected to be defined with a prefix like AGENT_1_, AGENT_2_, etc.
 * @returns {Array<object>} A list of agent configuration objects.
 */
export const loadAgentsFromEnv = () => {
  const agentConfigs = [];
  let i = 1;
  while (process.env[`AGENT_${i}_ID`]) {
    const isEnabled = process.env[`AGENT_${i}_ENABLED`] === 'true';
    if (!isEnabled) {
      logger.info(`Agent ${i} (${process.env[`AGENT_${i}_ID`]}) is disabled, skipping.`);
      i++;
      continue;
    }
    
    const config = {
      id: process.env[`AGENT_${i}_ID`],
      ownerName: process.env[`AGENT_${i}_OWNER_NAME`],
      assistantName: process.env[`AGENT_${i}_ASSISTANT_NAME`],
      phoneNumber: process.env[`AGENT_${i}_PHONE_NUMBER`],
      llmProvider: process.env[`AGENT_${i}_LLM_PROVIDER`],
      systemPrompt: process.env[`AGENT_${i}_SYSTEM_PROMPT`],
    };

    if (Object.values(config).some(val => val === undefined)) {
      logger.warn(`Agent ${i} is missing some configuration, skipping.`);
    } else {
      agentConfigs.push(config);
      logger.info(`Loaded configuration for agent: ${config.id} (${config.assistantName})`);
    }
    i++;
  }
  return agentConfigs;
};
