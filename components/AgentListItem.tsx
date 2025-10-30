
import React from 'react';
import { Link } from 'react-router-dom';
import { Agent } from '../types';
import { PowerIcon } from './icons/PowerIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';

interface AgentListItemProps {
  agent: Agent;
}

const AgentListItem: React.FC<AgentListItemProps> = ({ agent }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 flex flex-col justify-between hover:border-brand-primary transition-colors duration-300 shadow-lg">
      <div>
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-dark-text-primary">{agent.assistant_name}</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${agent.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <PowerIcon className="w-3 h-3"/>
                <span>{agent.is_active ? 'Active' : 'Inactive'}</span>
            </div>
        </div>
        <p className="text-sm text-dark-text-secondary mt-1">
          For: {agent.owner_name} ({agent.phone_number})
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center text-sm text-dark-text-secondary">
          <MessageSquareIcon className="w-4 h-4 mr-2" />
          {/* This data would ideally come from stats, mocking it for display */}
          <span>52 conversations today</span>
        </div>
        <Link 
          to={`/agent/${agent.id}`} 
          className="block text-center w-full mt-4 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors"
        >
          Manage Agent
        </Link>
      </div>
    </div>
  );
};

export default AgentListItem;
