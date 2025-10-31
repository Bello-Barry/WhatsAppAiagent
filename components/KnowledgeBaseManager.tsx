import React, { useState } from 'react';
import { api } from '../services/mockApi';
import { useParams } from 'react-router-dom';

// Simple interface for now. In a real app, this would be more complex.
interface Knowledge {
  id: string;
  content: string;
  createdAt: string;
}

const KnowledgeBaseManager: React.FC = () => {
    const { id: agentId } = useParams<{ id: string }>();
    const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
    const [newKnowledge, setNewKnowledge] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // In a real app, you'd fetch existing knowledge here.
    // For this example, we'll keep it simple.

    const handleAddKnowledge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKnowledge.trim() || !agentId) return;

        setLoading(true);
        setError('');
        try {
            // In a real app, the API would return the newly created item
            await api.addKnowledge(agentId, newKnowledge);
            // For the UI, we'll just add it locally with a mock ID
            setKnowledgeItems(prev => [...prev, { id: `local-${Date.now()}`, content: newKnowledge, createdAt: new Date().toISOString() }]);
            setNewKnowledge('');
        } catch (err) {
            setError('Failed to add knowledge.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-1">Knowledge Base</h3>
            <p className="text-dark-text-secondary mb-4">Add text-based information to help your agent answer specific questions about your products or services.</p>
            
            <form onSubmit={handleAddKnowledge} className="mb-6">
                <textarea
                    value={newKnowledge}
                    onChange={(e) => setNewKnowledge(e.target.value)}
                    rows={6}
                    className="block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="Paste text content here... for example, product descriptions, FAQs, company info."
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:bg-gray-600"
                >
                    {loading ? 'Adding...' : 'Add to Knowledge Base'}
                </button>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </form>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Current Knowledge</h4>
                {knowledgeItems.length === 0 ? (
                    <p className="text-dark-text-secondary">No knowledge items have been added yet.</p>
                ) : (
                    knowledgeItems.map(item => (
                        <div key={item.id} className="p-4 bg-gray-900 rounded-lg border border-dark-border">
                            <p className="text-sm text-dark-text-primary whitespace-pre-wrap">{item.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KnowledgeBaseManager;