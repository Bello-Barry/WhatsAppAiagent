import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Agent, Conversation, AgentStats, McpTool } from '../types';
import { PowerIcon } from '../components/icons/PowerIcon';
import QRCodeDisplay from '../components/QRCodeDisplay';

const AgentConfigForm = React.lazy(() => import('../components/AgentConfigForm'));
const ConversationHistory = React.lazy(() => import('../components/ConversationHistory'));
const StatCard = React.lazy(() => import('../components/StatCard'));

const McpToolsManager: React.FC<{ tools: McpTool[]; onUpdate: (tools: McpTool[]) => void }> = ({ tools, onUpdate }) => {
    const handleToggle = async (toolId: string, enabled: boolean) => {
        try {
            const updatedTool = await api.toggleMcpTool(toolId, enabled);
            onUpdate(tools.map(t => t.id === toolId ? updatedTool : t));
        } catch (error) {
            console.error("Failed to toggle MCP tool:", error);
            // Optionally show an error to the user
        }
    };

    if (tools.length === 0) {
      return <div className="text-center p-8 bg-dark-card rounded-lg">No MCP tools configured for this agent.</div>
    }

    return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 space-y-4">
            {tools.map(tool => (
                <div key={tool.id} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <div>
                        <p className="font-semibold">{tool.tool_name}</p>
                        <p className={`text-xs ${tool.tool_config.auth_status === 'connected' ? 'text-green-400' : 'text-yellow-400'}`}>
                            Status: {tool.tool_config.auth_status}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={tool.is_enabled} onChange={(e) => handleToggle(tool.id, e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                </div>
            ))}
        </div>
    );
};


const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'config' | 'stats' | 'tools'>('conversations');

  const fetchAgentData = useCallback(async () => {
    if (!id) return;
     try {
        const agentData = await api.getAgentById(id);
        if (agentData) {
          setAgent(agentData);
        } else {
          setError('Agent not found.');
        }
      } catch (err) {
        setError('Failed to refresh agent data.');
      }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agent details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);
  
  const handleConnectionSuccess = () => {
      console.log("Connection successful, refreshing agent data...");
      // Refetch agent data to update the is_active status
      fetchAgentData();
  }

  const TabButton = ({ tabName, label }: { tabName: 'conversations' | 'config' | 'stats' | 'tools', label: string }) => (
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

      {!agent.is_active && <QRCodeDisplay agentId={agent.id} onConnected={handleConnectionSuccess} />}
      
      <div className="border-b border-dark-border">
          <nav className="flex space-x-2" aria-label="Tabs">
              <TabButton tabName="conversations" label="Conversations" />
              <TabButton tabName="stats" label="Statistics" />
              <TabButton tabName="config" label="Configuration" />
              <TabButton tabName="tools" label="MCP Tools" />
          </nav>
      </div>
      
      <div className="mt-6">
        <Suspense fallback={<div className="text-center p-8">Loading component...</div>}>
            {activeTab === 'conversations' && <ConversationHistory conversations={conversations} />}
            {activeTab === 'config' && <AgentConfigForm agent={agent} onUpdate={setAgent} />}
            {activeTab === 'stats' && (stats.length > 0 ? <StatCard stats={stats} /> : <div className="text-center p-8 bg-dark-card rounded-lg">No statistics available yet.</div>)}
            {activeTab === 'tools' && <McpToolsManager tools={tools} onUpdate={setTools} />}
        </Suspense>
      </div>
    </div>
  );
};

export default AgentDetailPage;
