import logger from "../utils/logger.js";

const MAX_HISTORY_LENGTH = 20; // Max number of messages (user + assistant) to keep in memory

export class MemoryManager {
  constructor() {
    this.conversations = new Map();
  }

  /**
   * Adds a message to a conversation's history.
   * @param {string} conversationId - A unique identifier for the conversation (e.g., agentId-contactJid).
   * @param {{role: 'user' | 'assistant', content: string}} message - The message object.
   */
  addMessage(conversationId, message) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }

    const history = this.conversations.get(conversationId);
    history.push(message);

    // Prune old messages to keep the history from growing indefinitely
    if (history.length > MAX_HISTORY_LENGTH) {
      history.splice(0, history.length - MAX_HISTORY_LENGTH);
    }
  }

  /**
   * Retrieves the history for a specific conversation.
   * @param {string} conversationId - The conversation identifier.
   * @returns {Array<{role: 'user' | 'assistant', content: string}>} - The conversation history.
   */
  getHistory(conversationId) {
    return this.conversations.get(conversationId) || [];
  }

  /**
   * Clears the history for a specific conversation.
   * @param {string} conversationId - The conversation identifier.
   */
  clearHistory(conversationId) {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
      logger.info(`Cleared history for conversation: ${conversationId}`);
    }
  }
}

export const memoryManager = new MemoryManager();