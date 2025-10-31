import { isJidUser } from '@whiskeysockets/baileys';
import { getLLMResponse } from '../ai/llm-router.js';
import logger from '../utils/logger.js';
import { supabase } from './supabase-client.js';

// Anti-spam and rate limiting config
const MESSAGE_DELAY_MS = 1500 + Math.random() * 1000;
const recentMessages = new Set();
const SPAM_WINDOW_MS = 5000;
const MAX_MESSAGES_IN_WINDOW = 3;

/**
 * Ensures a conversation record exists in the database and returns it.
 * @param {string} agentId 
 * @param {string} contactNumber 
 * @returns {object} The conversation object from Supabase.
 */
const getOrCreateConversation = async (agentId, contactNumber) => {
    let { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('agent_id', agentId)
        .eq('contact_number', contactNumber)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        throw error;
    }

    if (!conversation) {
        const { data: newConversation, error: insertError } = await supabase
            .from('conversations')
            .insert({ agent_id: agentId, contact_number: contactNumber })
            .select()
            .single();
        if (insertError) throw insertError;
        conversation = newConversation;
    }
    return conversation;
};

export const handleMessage = async (msg, agent) => {
  const from = msg.key.remoteJid;

  if (msg.key.fromMe || !isJidUser(from) || !msg.message.conversation) {
    return;
  }

  const senderId = `${agent.id}-${from}`;
  const contactNumber = from.split('@')[0];
  const messageContent = msg.message.conversation.trim();
  const messageTimestamp = new Date().getTime();

  const userMessages = Array.from(recentMessages).filter(m => m.startsWith(senderId));
  if (userMessages.length >= MAX_MESSAGES_IN_WINDOW) {
      logger.warn({ senderId }, 'Spam detected. Ignoring message.');
      return;
  }
  recentMessages.add(`${senderId}:${messageTimestamp}`);
  setTimeout(() => recentMessages.delete(`${senderId}:${messageTimestamp}`), SPAM_WINDOW_MS);


  if (messageContent.toUpperCase() === 'STOP') {
    logger.info({ senderId }, 'User requested to stop.');
    return;
  }
  
  const handoverRegex = new RegExp(`parler à ${agent.config.ownerName}`, 'i');
  if (handoverRegex.test(messageContent)) {
    logger.info({ senderId }, 'User requested human handover.');
    await agent.sock.sendMessage(from, { text: `D'accord, je préviens ${agent.config.ownerName}. Il vous répondra dès que possible.` });
    return;
  }

  logger.info({ from, agent: agent.id, message: messageContent }, 'Received new message');

  try {
    await agent.sock.sendPresenceUpdate('composing', from);
    await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS));

    const conversation = await getOrCreateConversation(agent.id, contactNumber);

    const { data: historyData, error: historyError } = await supabase
        .from('messages')
        .select('sender, content')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
        .limit(20);

    if (historyError) throw historyError;

    // Adapt DB schema to the format expected by the LLM router
    const history = historyData.map(m => ({
        role: m.sender,
        content: m.content
    }));

    const aiResponse = await getLLMResponse(messageContent, history, agent.config);
    
    await agent.sock.sendMessage(from, { text: aiResponse });
    logger.info({ to: from, agent: agent.id, response: aiResponse }, 'Sent AI response');
    
    // Save messages to database
    const { error: insertError } = await supabase.from('messages').insert([
        { conversation_id: conversation.id, sender: 'user', content: messageContent },
        { conversation_id: conversation.id, sender: 'assistant', content: aiResponse }
    ]);
    if (insertError) logger.error(insertError, 'Failed to save messages to DB');

  } catch (error) {
    logger.error(error, `Error processing message for agent ${agent.id}`);
    await agent.sock.sendMessage(from, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." });
  }
};