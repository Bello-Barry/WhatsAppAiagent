import { isJidUser } from '@whiskeysockets/baileys';
import { getLLMResponse } from '../ai/llm-router.js';
import logger from '../utils/logger.js';
import { supabase } from '../config/supabase-client.js';

const MESSAGE_DELAY_MS = 1500 + Math.random() * 1000;

const getConversationHistory = async (agentId, contactNumber) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('messages')
    .eq('agent_id', agentId)
    .eq('contact_number', contactNumber)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "not found" error
    logger.error(error, `Error fetching history for ${agentId}-${contactNumber}`);
    return [];
  }
  return data?.messages || [];
};

const saveConversation = async (agentId, contactNumber, userMessage, assistantMessage) => {
    const newMessages = [userMessage, assistantMessage];
    
    const { error } = await supabase.rpc('append_to_conversation', {
        p_agent_id: agentId,
        p_contact_number: contactNumber,
        new_messages: newMessages
    });

    if (error) {
        logger.error(error, `Error saving conversation for ${agentId}-${contactNumber}`);
    }
};

export const handleMessage = async (msg, agent) => {
  const { from, key } = msg;

  if (key.fromMe || !isJidUser(from) || !msg.message.conversation) {
    return;
  }

  const messageContent = msg.message.conversation.trim();
  const contactNumber = from.split('@')[0];

  logger.info({ from: contactNumber, agent: agent.id, message: messageContent }, 'Received new message');

  try {
    await agent.sock.sendPresenceUpdate('composing', from);
    await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS));

    const history = await getConversationHistory(agent.id, contactNumber);
    
    const llmHistory = history.map(msg => ({
        role: msg.sender === 'assistant' ? 'assistant' : 'user',
        content: msg.content
    }));

    const aiResponse = await getLLMResponse(messageContent, llmHistory, agent.config);
    
    await agent.sock.sendMessage(from, { text: aiResponse });
    logger.info({ to: contactNumber, agent: agent.id, response: aiResponse }, 'Sent AI response');

    const userMessageToSave = {
      sender: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    const assistantMessageToSave = {
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    await saveConversation(agent.id, contactNumber, userMessageToSave, assistantMessageToSave);

  } catch (error) {
    logger.error(error, `Error processing message for agent ${agent.id}`);
    await agent.sock.sendMessage(from, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." });
  }
};