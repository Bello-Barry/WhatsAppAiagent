export interface User {
  id: string;
  email: string | undefined;
}

export enum LlmProvider {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
}

export interface Agent {
  id: string;
  user_id: string;
  phone_number: string | null;
  owner_name: string;
  assistant_name: string;
  llm_provider: LlmProvider;
  custom_prompt: string | null;
  is_active: boolean;
  created_at: string;
  qr_code_url: string | null;
  connection_status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'LOGGED_OUT' | string;
}

export interface Message {
  id?: number;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  contact_number: string;
  messages?: Message[]; // Messages might be loaded separately
  last_message_at: string | null;
  created_at: string;
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

export interface Knowledge {
    id: number;
    agent_id: string;
    content: string;
    created_at: string;
}