import { User, Agent, Conversation, AgentStats, McpTool } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('User not authenticated');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
};


const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred' }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const api = {
  getAgents: async (): Promise<Agent[]> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/agents`, { headers }).then(handleResponse);
  },
  
  getAgentById: async (id: string): Promise<Agent | undefined> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/agents/${id}`, { headers }).then(handleResponse);
  },
  
  getQRCodeStatus: async (agentId: string): Promise<{status: string, qr?: string, message?: string}> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/qr/${agentId}`, { headers }).then(handleResponse);
  },
  
  updateAgent: async (agentData: Partial<Agent> & { id: string }): Promise<Agent> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/agents/${agentData.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(agentData),
    }).then(handleResponse);
  },
  
  getAgentStats: async (agentId: string): Promise<AgentStats[]> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/agents/${agentId}/stats`, { headers }).then(handleResponse);
  },
  
  getConversations: async (agentId: string): Promise<Conversation[]> => {
     const headers = await getAuthHeaders();
     return fetch(`${API_BASE_URL}/agents/${agentId}/conversations`, { headers }).then(handleResponse);
  },

  getMcpTools: async (agentId: string): Promise<McpTool[]> => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE_URL}/agents/${agentId}/tools`, { headers }).then(handleResponse);
  },

  toggleMcpTool: async (toolId: string, isEnabled: boolean): Promise<McpTool> => {
    const headers = await getAuthHeaders();
    // This endpoint remains a stub as it's not fully defined in the backend yet
    return fetch(`${API_BASE_URL}/tools/${toolId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_enabled: isEnabled }),
    }).then(handleResponse);
  },
};