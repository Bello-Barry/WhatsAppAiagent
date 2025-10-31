import React, { useState } from 'react';
import { Agent, LlmProvider } from '../types';
import { api } from '../services/api';

interface AgentConfigFormProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

const AgentConfigForm: React.FC<AgentConfigFormProps> = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState(agent);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const updatedAgent = await api.updateAgent(formData);
      onUpdate(updatedAgent);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update agent", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold">Agent Configuration</h3>
        <p className="text-dark-text-secondary mt-1">Customize the personality and behavior of your AI assistant.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-t border-dark-border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="owner_name" className="block text-sm font-medium text-dark-text-secondary">Owner Name</label>
            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
            <input type="text" name="owner_name" id="owner_name" value={formData.owner_name} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="assistant_name" className="block text-sm font-medium text-dark-text-secondary">Assistant Name</label>
            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
            <input type="text" name="assistant_name" id="assistant_name" value={formData.assistant_name} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="llm_provider" className="block text-sm font-medium text-dark-text-secondary">AI Model Provider</label>
            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
            <select name="llm_provider" id="llm_provider" value={formData.llm_provider} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
              {Object.values(LlmProvider).map(provider => (
                <option key={provider} value={provider}>{provider.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="custom_prompt" className="block text-sm font-medium text-dark-text-secondary">Custom System Prompt</label>
            {/* FIX: Replaced custom 'input-style' class with Tailwind CSS classes to resolve style jsx error. */}
            <textarea name="custom_prompt" id="custom_prompt" value={formData.custom_prompt} onChange={handleChange} rows={5} className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            <p className="mt-2 text-xs text-gray-400">Define the core personality and instructions for your agent.</p>
          </div>
        </div>
        <div className="p-6 bg-gray-900/50 flex items-center justify-end rounded-b-lg">
          {success && <p className="text-sm text-green-400 mr-4">Successfully saved!</p>}
          <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:bg-gray-600">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      {/* FIX: Removed unsupported <style jsx> block, which caused a compilation error. Styles are now handled by Tailwind CSS. */}
    </div>
  );
};

export default AgentConfigForm;