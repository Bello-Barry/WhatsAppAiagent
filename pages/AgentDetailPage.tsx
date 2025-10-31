
import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/mockApi';
import { Agent, Conversation, AgentStats, McpTool } from '../types';
import { PowerIcon } from '../components/icons/PowerIcon';
import QRCodeDisplay from '../components/QRCodeDisplay';

const AgentConfigForm = React.lazy(() => import('../components/AgentConfigForm'));
const ConversationHistory = React.lazy(() => import('../components/ConversationHistory'));
const StatCard = React.lazy(() => import('../components/StatCard'));
const KnowledgeBaseManager = React.lazy(() => import('../components/KnowledgeBaseManager'));


const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'config' | 'stats' | 'tools' | 'knowledge'>('conversations');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentData, convosData, statsData, toolsData] = await Promise.all([
          api.getAgentById(id),
          api.getConversations(id),
          api.getAgentStats(id),
          api.getMcpTools(id)
        ]);
        if (agentData) {
          setAgent(agentData);
          setConversations(convosData);
          setStats(statsData);
          setTools(toolsData);
        } else {
          setError('Agent not found.');
        }
      } catch (err) {
        setError('Failed to fetch agent details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  
  const TabButton = ({ tabName, label }: { tabName: 'conversations' | 'config' | 'stats' | 'tools' | 'knowledge', label: string }) => (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-dark-card'}`}
      >
        {label}
      </button>
  );

  if (loading) return (
      <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin"></div>
      </div>
  );
  if (error) return <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>;
  if (!agent) return <div>Agent not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">{agent.assistant_name}</h1>
            <p className="text-dark-text-secondary mt-1">Managing agent for {agent.owner_name}</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold ${agent.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <PowerIcon className="w-5 h-5"/>
            <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {!agent.is_active && <QRCodeDisplay agentId={agent.id} />}
      
      <div className="border-b border-dark-border">
          <nav className="flex space-x-2" aria-label="Tabs">
              <TabButton tabName="conversations" label="Conversations" />
              <TabButton tabName="stats" label="Statistics" />
              <TabButton tabName="config" label="Configuration" />
              <TabButton tabName="knowledge" label="Knowledge Base" />
              <TabButton tabName="tools" label="MCP Tools" />
          </nav>
      </div>
      
      <div className="mt-6">
        <Suspense fallback={<div>Loading component...</div>}>
            {activeTab === 'conversations' && <ConversationHistory conversations={conversations} />}
            {activeTab === 'config' && <AgentConfigForm agent={agent} onUpdate={setAgent} />}
            {activeTab === 'stats' && <StatCard stats={stats} />}
            {activeTab === 'knowledge' && <KnowledgeBaseManager />}
            {activeTab === 'tools' && <McpToolsManager tools={tools} onUpdate={setTools} />}
        </Suspense>
      </div>
    </div>
  );
};

const McpToolsManager: React.FC<{ tools: McpTool[]; onUpdate: (tools: McpTool[]) => void }> = ({ tools, onUpdate }) => {
    const handleToggle = async (toolId: string, enabled: boolean) => {
        const updatedTool = await api.toggleMcpTool(toolId, enabled);
        onUpdate(tools.map(t => t.id === toolId ? updatedTool : t));
    };

    return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Manage Integrations (MCP)</h3>
            <div className="space-y-4">
                {tools.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <div>
                            <p className="font-semibold">{tool.tool_name}</p>
                            <p className="text-sm text-dark-text-secondary">Status: {tool.tool_config.auth_status}</p>
                        </div>
                        <label htmlFor={`toggle-${tool.id}`} className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id={`toggle-${tool.id}`} className="sr-only" checked={tool.is_enabled} onChange={(e) => handleToggle(tool.id, e.target.checked)} />
                                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${tool.is_enabled ? 'translate-x-6 bg-brand-primary' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default AgentDetailPage;