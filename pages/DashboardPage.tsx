
import React, { useEffect, useState } from 'react';
import { api } from '../services/mockApi';
import { Agent } from '../types';
import AgentListItem from '../components/AgentListItem';

const DashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const agentData = await api.getAgents();
        setAgents(agentData);
      } catch (err) {
        setError('Failed to fetch agents.');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agents Dashboard</h1>
        <p className="text-dark-text-secondary mt-1">
          Manage your WhatsApp AI agents at a glance.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentListItem key={agent.id} agent={agent} />
          ))}
           <div className="flex items-center justify-center border-2 border-dashed border-dark-border rounded-lg p-6 text-dark-text-secondary hover:bg-dark-card hover:border-brand-primary transition-all cursor-pointer">
                <div className="text-center">
                    <div className="text-4xl">+</div>
                    <div className="mt-2 font-semibold">Add New Agent</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
