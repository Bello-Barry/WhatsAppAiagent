import logger from "../utils/logger.js";

class KnowledgeManager {
    constructor() {
        // In-memory store: Map<agentId, string[]>
        this.knowledgeBases = new Map();
    }

    /**
     * Adds a piece of text content to an agent's knowledge base.
     * @param {string} agentId 
     * @param {string} content 
     */
    addContent(agentId, content) {
        if (!this.knowledgeBases.has(agentId)) {
            this.knowledgeBases.set(agentId, []);
        }
        const knowledge = this.knowledgeBases.get(agentId);
        knowledge.push(content);
        logger.info(`Added knowledge content for agent ${agentId}.`);
    }

    /**
     * Retrieves all knowledge content for an agent.
     * @param {string} agentId 
     * @returns {string[]}
     */
    getKnowledge(agentId) {
        return this.knowledgeBases.get(agentId) || [];
    }

    /**
     * Retrieves all knowledge content for an agent as a single formatted string.
     * @param {string} agentId
     * @returns {string}
     */
    getKnowledgeAsContext(agentId) {
        const knowledge = this.getKnowledge(agentId);
        if (knowledge.length === 0) {
            return '';
        }
        return `\n\n--- Knowledge Base ---\nHere is some information you should use to answer user questions:\n${knowledge.join('\n---\n')}\n--- End of Knowledge Base ---`;
    }
}

export const knowledgeManager = new KnowledgeManager();