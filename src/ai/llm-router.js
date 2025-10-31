import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger.js';
import { knowledgeManager } from './knowledge-manager.js';

let gemini;
if (process.env.GEMINI_API_KEY) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  gemini = ai;
}

const getGeminiResponse = async (prompt, history, systemPrompt, agentId) => {
  if (!gemini) {
    throw new Error('Gemini API key not configured.');
  }
  
  const model = 'gemini-2.5-flash';
  logger.info(`Querying Gemini model: ${model} for agent ${agentId}`);

  const knowledgeContext = knowledgeManager.getKnowledgeAsContext(agentId);
  const fullSystemPrompt = `${systemPrompt}${knowledgeContext}`;

  const chat = gemini.chats.create({
      model: model,
      config: {
        systemInstruction: fullSystemPrompt,
      },
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }))
  });

  const result = await chat.sendMessage({ message: prompt });
  return result.text;
};

const getOpenAIResponse = async (prompt, history, systemPrompt, agentId) => {
  // Placeholder for OpenAI integration
  logger.warn('OpenAI provider is not yet implemented.');
  return `(Mock OpenAI Response) You said: "${prompt}"`;
};

const getDeepSeekResponse = async (prompt, history, systemPrompt, agentId) => {
  // Placeholder for DeepSeek integration
  logger.warn('DeepSeek provider is not yet implemented.');
  return `(Mock DeepSeek Response) You said: "${prompt}"`;
};

const providers = {
  gemini: getGeminiResponse,
  openai: getOpenAIResponse,
  deepseek: getDeepSeekResponse,
};

export const getLLMResponse = async (prompt, history, agentConfig) => {
  const provider = providers[agentConfig.llmProvider];
  if (!provider) {
    throw new Error(`Unsupported LLM provider: ${agentConfig.llmProvider}`);
  }
  return provider(prompt, history, agentConfig.systemPrompt, agentConfig.id);
};