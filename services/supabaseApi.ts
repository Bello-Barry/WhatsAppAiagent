import { supabase } from '../supabase/client';
import { Agent, Conversation, Message, AgentStats, Knowledge } from '../types';

const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(error.message || `An error occurred during ${context}.`);
    }
};

export const supabaseApi = {
    getAgents: async (): Promise<Agent[]> => {
        const { data, error } = await supabase.from('agents').select('*');
        handleSupabaseError(error, 'getAgents');
        return data || [];
    },

    getAgentById: async (id: string): Promise<Agent | null> => {
        const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();
        handleSupabaseError(error, 'getAgentById');
        return data;
    },

    getConversations: async (agentId: string): Promise<Conversation[]> => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('agent_id', agentId)
            .order('last_message_at', { ascending: false });
        handleSupabaseError(error, 'getConversations');
        return data || [];
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        handleSupabaseError(error, 'getMessages');
        return data || [];
    },

    sendMessage: async (conversationId: string, content: string, sender: 'user' | 'assistant'): Promise<Message> => {
        const { data, error } = await supabase
            .from('messages')
            .insert({ conversation_id: conversationId, content, sender })
            .select()
            .single();
        handleSupabaseError(error, 'sendMessage');
        if(!data) throw new Error("Failed to send message: no data returned.");
        return data;
    },

    updateAgent: async (agentData: Partial<Agent> & { id: string }): Promise<Agent> => {
        const { id, ...updateData } = agentData;
        const { data, error } = await supabase
            .from('agents')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        handleSupabaseError(error, 'updateAgent');
        if(!data) throw new Error("Failed to update agent: no data returned.");
        return data;
    },

    getKnowledge: async (agentId: string): Promise<Knowledge[]> => {
        const { data, error } = await supabase
            .from('knowledge')
            .select('*')
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false });
        handleSupabaseError(error, 'getKnowledge');
        return data || [];
    },

    addKnowledge: async (agentId: string, content: string): Promise<Knowledge> => {
        const { data, error } = await supabase
            .from('knowledge')
            .insert({ agent_id: agentId, content })
            .select()
            .single();
        handleSupabaseError(error, 'addKnowledge');
        if(!data) throw new Error("Failed to add knowledge: no data returned.");
        return data;
    },
    
    getAgentStats: async (agentId: string): Promise<AgentStats[]> => {
        console.warn(`getAgentStats for ${agentId} is using mocked data.`);
        const stats: AgentStats[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            stats.push({
            date: date.toISOString().split('T')[0],
            messages_sent: Math.floor(Math.random() * (70 - 20 + 1)) + 20,
            messages_received: Math.floor(Math.random() * (60 - 15 + 1)) + 15,
            avg_response_time_ms: Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200,
            });
        }
        return Promise.resolve(stats);
    },
};
