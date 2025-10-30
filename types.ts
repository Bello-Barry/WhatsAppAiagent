
export interface User {
  id: string;
  email: string;
}

export enum LlmProvider {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
}

export interface Agent {
  id: string;
  user_id: string;
  phone_number: string;
  owner_name: string;
  assistant_name: string;
  llm_provider: LlmProvider;
  custom_prompt: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  contact_number: string;
  messages: Message[];
  last_message_at: string;
}

export interface McpTool {
    id: string;
    agent_id: string;
    tool_name: string;
    tool_config: Record<string, any>;
    is_enabled: boolean;
}

export interface AgentStats {
    date: string; // YYYY-MM-DD
    messages_sent: number;
    messages_received: number;
    avg_response_time_ms: number;
}
