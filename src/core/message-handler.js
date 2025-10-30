import { isJidUser } from '@whiskeysockets/baileys';
import { getLLMResponse } from '../ai/llm-router.js';
import logger from '../utils/logger.js';
import { MemoryManager } from '../ai/memory-manager.js';

// Anti-spam and rate limiting config
const MESSAGE_DELAY_MS = 1500 + Math.random() * 1000; // Simulate human-like delay
const recentMessages = new Set();
const SPAM_WINDOW_MS = 5000; // 5 seconds window
const MAX_MESSAGES_IN_WINDOW = 3;

const memoryManager = new MemoryManager();

/**
 * Handles an incoming message for a specific agent.
 * @param {import('@whiskeysockets/baileys').WAMessage} msg - The incoming message object.
 * @param {import('./whatsapp-client.js').WhatsappClient} agent - The agent instance that received the message.
 */
export const handleMessage = async (msg, agent) => {
  const { from, key } = msg;

  // 1. Basic validations and filtering
  if (key.fromMe || !isJidUser(from) || !msg.message.conversation) {
    return;
  }

  const senderId = `${agent.id}-${from}`;
  const messageContent = msg.message.conversation.trim();
  const messageTimestamp = new Date().getTime();

  // 2. Anti-spam check (simple implementation)
  const userMessages = Array.from(recentMessages).filter(m => m.startsWith(senderId));
  if (userMessages.length >= MAX_MESSAGES_IN_WINDOW) {
      logger.warn({ senderId }, 'Spam detected. Ignoring message.');
      return;
  }
  recentMessages.add(`${senderId}:${messageTimestamp}`);
  setTimeout(() => recentMessages.delete(`${senderId}:${messageTimestamp}`), SPAM_WINDOW_MS);


  // 3. Command handling
  if (messageContent.toUpperCase() === 'STOP') {
    logger.info({ senderId }, 'User requested to stop. No response will be sent.');
    // Here you could add them to an opt-out list in a database
    return;
  }
  
  // 4. Human handover check
  const handoverRegex = new RegExp(`parler à ${agent.config.ownerName}`, 'i');
  if (handoverRegex.test(messageContent)) {
    logger.info({ senderId }, 'User requested human handover.');
    await agent.sock.sendMessage(from, { text: "D'accord, je préviens John. Il vous répondra dès que possible." });
    // TODO: Implement a notification system (email, Slack, etc.) to alert the owner.
    return;
  }

  logger.info({ from, agent: agent.id, message: messageContent }, 'Received new message');

  try {
    // 5. Simulate human behavior (typing presence)
    await agent.sock.sendPresenceUpdate('composing', from);
    await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS));

    // 6. Get conversation history
    const history = memoryManager.getHistory(senderId);

    // 7. Get AI response
    const aiResponse = await getLLMResponse(messageContent, history, agent.config);
    
    // 8. Send response
    await agent.sock.sendMessage(from, { text: aiResponse });
    logger.info({ to: from, agent: agent.id, response: aiResponse }, 'Sent AI response');
    
    // 9. Update memory
    memoryManager.addMessage(senderId, { role: 'user', content: messageContent });
    memoryManager.addMessage(senderId, { role: 'assistant', content: aiResponse });

  } catch (error) {
    logger.error(error, `Error processing message for agent ${agent.id}`);
    await agent.sock.sendMessage(from, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." });
  }
};
