import { User, Agent, Conversation, AgentStats, McpTool } from '../types';

const API_BASE_URL = '/api'; // Using a relative path, assuming the frontend is served by the backend or a proxy

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const api = {
  login: async (email: string, pass: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
    });
    return handleResponse(response);
  },
  
  logout: (): Promise<void> => {
    // In a real app, this would call a '/api/auth/logout' endpoint
    return Promise.resolve();
  },

  getAgents: (): Promise<Agent[]> => {
    return fetch(`${API_BASE_URL}/agents`).then(handleResponse);
  },

  getAgentById: (id: string): Promise<Agent | undefined> => {
    return fetch(`${API_BASE_URL}/agents/${id}`).then(handleResponse);
  },

  getAgentStats: (agentId: string): Promise<AgentStats[]> => {
    return fetch(`${API_BASE_URL}/agents/${agentId}/stats`).then(handleResponse);
  },

  getConversations: (agentId: string): Promise<Conversation[]> => {
    return fetch(`${API_BASE_URL}/agents/${agentId}/conversations`).then(handleResponse);
  },
  
  getQRCode: (agentId: string): Promise<{ status: string; qr?: string; message?: string }> => {
     return fetch(`${API_BASE_URL}/qr/${agentId}`).then(handleResponse);
  },

  // FIX: Added `async` to the function to allow for `await` usage.
  updateAgent: async (agentData: Partial<Agent> & { id: string }): Promise<Agent> => {
    const response = await fetch(`${API_BASE_URL}/agents/${agentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
    });
    return handleResponse(response);
  },
  
  getMcpTools: (agentId: string): Promise<McpTool[]> => {
      // This is still mocked as the backend doesn't have a real tool management system yet
      const MOCK_TOOLS: McpTool[] = [
        { id: 'tool-1', agent_id: agentId, tool_name: 'Google Calendar', tool_config: { 'auth_status': 'connected' }, is_enabled: true },
        { id: 'tool-2', agent_id: agentId, tool_name: 'Notion', tool_config: { 'auth_status': 'disconnected' }, is_enabled: false },
    ];
    return new Promise(resolve => setTimeout(() => resolve(MOCK_TOOLS), 300));
  },
  
  toggleMcpTool: (toolId: string, isEnabled: boolean): Promise<McpTool> => {
      // This is still mocked
      console.log(`Toggling tool ${toolId} to ${isEnabled}`);
      return new Promise(resolve => setTimeout(() => resolve({
          id: toolId, 
          agent_id: 'agent-001', 
          tool_name: 'Google Calendar', 
          tool_config: { 'auth_status': 'connected' }, 
          is_enabled: isEnabled 
      }), 300));
  }
};