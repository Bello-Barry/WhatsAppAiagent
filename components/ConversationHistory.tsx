import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { SendIcon } from './icons/SendIcon';
import { supabaseApi } from '../services/supabaseApi';
import { supabase } from '../supabase/client';

interface ConversationHistoryProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  agentId: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversations, setConversations, agentId }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
        const fetchedMessages = await supabaseApi.getMessages(selectedConversation.id);
        setMessages(fetchedMessages);
    }
    fetchMessages();

    const channel = supabase.channel(`conversation-${selectedConversation.id}`)
        .on<Message>(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, 
            payload => {
                setMessages(currentMessages => [...currentMessages, payload.new as Message]);
            }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }

  }, [selectedConversation]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
        await supabaseApi.sendMessage(selectedConversation.id, newMessage, 'user');
        setNewMessage('');
    } catch(err) {
        console.error("Failed to send message", err);
    }
  };
  
  const handleSelectConversation = (convo: Conversation) => {
      setMessages([]); // Clear messages while new ones are loading
      setSelectedConversation(convo);
  }

  if (conversations.length === 0) {
      return (
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center text-dark-text-secondary">
              No conversations yet.
          </div>
      );
  }

  return (
    <div className="flex flex-col md:flex-row h-[70vh] bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-dark-border flex-shrink-0 overflow-y-auto">
        {conversations.map(convo => (
          <div
            key={convo.id}
            onClick={() => handleSelectConversation(convo)}
            className={`p-4 cursor-pointer border-b border-dark-border last:border-b-0 ${selectedConversation?.id === convo.id ? 'bg-brand-primary/10' : 'hover:bg-gray-900/50'}`}
          >
            <p className="font-semibold">{convo.contact_number}</p>
            {/* <p className="text-sm text-dark-text-secondary truncate">
              {convo.messages[convo.messages.length - 1].content}
            </p> */}
          </div>
        ))}
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'assistant' ? 'bg-gray-700 rounded-bl-none' : 'bg-brand-secondary text-white rounded-br-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-60 text-right mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-dark-border">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-900 border border-dark-border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                <button type="submit" className="bg-brand-primary p-2.5 rounded-full text-white hover:bg-brand-secondary transition-colors">
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-dark-text-secondary">
            Select a conversation to view messages.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;