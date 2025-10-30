
import { User, Agent, LlmProvider, Conversation, AgentStats, McpTool } from '../types';

// --- MOCK DATABASE ---
const MOCK_USER: User = { id: 'user-123', email: 'client@saas.com' };

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    user_id: 'user-123',
    phone_number: '+15550100',
    owner_name: 'John Doe',
    assistant_name: 'Eva',
    llm_provider: LlmProvider.GEMINI,
    custom_prompt: 'You are Eva, a helpful and friendly personal assistant for John Doe. Keep your responses concise and warm.',
    is_active: true,
    created_at: '2023-10-26T10:00:00Z',
  },
  {
    id: 'agent-002',
    user_id: 'user-123',
    phone_number: '+15550101',
    owner_name: 'Jane Smith',
    assistant_name: 'Alex',
    llm_provider: LlmProvider.OPENAI,
    custom_prompt: 'You are Alex, a professional business assistant for Jane Smith. Be formal and efficient.',
    is_active: false,
    created_at: '2023-10-25T14:30:00Z',
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-001-A',
        agent_id: 'agent-001',
        contact_number: '+15550200',
        last_message_at: new Date().toISOString(),
        messages: [
            { sender: 'user', content: 'Hi Eva, can you check my calendar for tomorrow?', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
            { sender: 'assistant', content: 'Of course, John! Let me check that for you. One moment...', timestamp: new Date(Date.now() - 4 * 60000).toISOString() },
            { sender: 'assistant', content: 'You have a meeting with the marketing team at 10 AM tomorrow.', timestamp: new Date(Date.now() - 3 * 60000).toISOString() },
            { sender: 'user', content: 'Great, thanks!', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
        ]
    },
    {
        id: 'conv-001-B',
        agent_id: 'agent-001',
        contact_number: '+15550201',
        last_message_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        messages: [
            { sender: 'user', content: 'Hello?', timestamp: new Date(Date.now() - 24 * 3600000 - 60000).toISOString() },
            { sender: 'assistant', content: 'Hi there! This is Eva, John Doe\'s assistant. How can I help you?', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
        ]
    }
];

const MOCK_STATS: { [agentId: string]: AgentStats[] } = {
    'agent-001': Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
            date: d.toISOString().split('T')[0],
            messages_sent: Math.floor(Math.random() * 50) + 20,
            messages_received: Math.floor(Math.random() * 50) + 20,
            avg_response_time_ms: Math.floor(Math.random() * 1500) + 500
        }
    }).reverse(),
     'agent-002': Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
            date: d.toISOString().split('T')[0],
            messages_sent: Math.floor(Math.random() * 30),
            messages_received: Math.floor(Math.random() * 30),
            avg_response_time_ms: Math.floor(Math.random() * 2000) + 800
        }
    }).reverse()
};

const MOCK_TOOLS: McpTool[] = [
    { id: 'tool-1', agent_id: 'agent-001', tool_name: 'Google Calendar', tool_config: { 'auth_status': 'connected' }, is_enabled: true },
    { id: 'tool-2', agent_id: 'agent-001', tool_name: 'Notion', tool_config: { 'auth_status': 'disconnected' }, is_enabled: false },
]

// --- API FUNCTIONS ---
const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

export const api = {
  login: (email: string, pass: string): Promise<User> => {
    console.log(`Attempting login for ${email}`);
    if (email === 'client@saas.com' && pass === 'password') {
      return simulateDelay(MOCK_USER);
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  logout: (): Promise<void> => {
    return simulateDelay(undefined, 200);
  },
  getAgents: (): Promise<Agent[]> => {
    return simulateDelay(MOCK_AGENTS);
  },
  getAgentById: (id: string): Promise<Agent | undefined> => {
    const agent = MOCK_AGENTS.find(a => a.id === id);
    return simulateDelay(agent);
  },
  getAgentStats: (agentId: string): Promise<AgentStats[]> => {
    return simulateDelay(MOCK_STATS[agentId] || []);
  },
  getConversations: (agentId: string): Promise<Conversation[]> => {
    const convos = MOCK_CONVERSATIONS.filter(c => c.agent_id === agentId);
    return simulateDelay(convos);
  },
  getQRCode: (agentId: string): Promise<string> => {
    console.log(`Generating QR code for agent ${agentId}`);
    // Using a placeholder image service for the QR code
    return simulateDelay(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=whatsapp-session-${agentId}-${Date.now()}`);
  },
  updateAgent: (agentData: Partial<Agent> & { id: string }): Promise<Agent> => {
    const index = MOCK_AGENTS.findIndex(a => a.id === agentData.id);
    if (index > -1) {
      MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...agentData };
      return simulateDelay(MOCK_AGENTS[index]);
    }
    return Promise.reject(new Error('Agent not found'));
  },
  getMcpTools: (agentId: string): Promise<McpTool[]> => {
      const tools = MOCK_TOOLS.filter(t => t.agent_id === agentId);
      return simulateDelay(tools);
  },
  toggleMcpTool: (toolId: string, isEnabled: boolean): Promise<McpTool> => {
      const tool = MOCK_TOOLS.find(t => t.id === toolId);
      if (tool) {
          tool.is_enabled = isEnabled;
          return simulateDelay(tool);
      }
      return Promise.reject(new Error('Tool not found'));
  }
};
