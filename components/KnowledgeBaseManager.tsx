import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../services/supabaseApi';
import { Knowledge } from '../types';

interface KnowledgeBaseManagerProps {
    agentId: string;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ agentId }) => {
    const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
    const [newKnowledge, setNewKnowledge] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!agentId) return;

        const fetchKnowledge = async () => {
            try {
                const items = await supabaseApi.getKnowledge(agentId);
                setKnowledgeItems(items);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch knowledge base.');
            }
        };
        fetchKnowledge();
    }, [agentId]);


    const handleAddKnowledge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKnowledge.trim() || !agentId) return;

        setLoading(true);
        setError('');
        try {
            const newItem = await supabaseApi.addKnowledge(agentId, newKnowledge);
            setKnowledgeItems(prev => [...prev, newItem]);
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
                    disabled={loading || !newKnowledge.trim()}
                    className="mt-3 px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:bg-gray-600 disabled:cursor-not-allowed"
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