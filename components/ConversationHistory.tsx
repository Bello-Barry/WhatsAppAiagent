import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { SendIcon } from './icons/SendIcon';
// The real api is now implicitly used project-wide. No need for a specific API call here for sending messages from the dashboard yet.

interface ConversationHistoryProps {
  conversations: Conversation[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select the first conversation by default if it exists and none is selected
    if (!selectedConversation && conversations.length > 0) {
      // Find the most recent conversation to display first
      const sortedConversations = [...conversations].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setSelectedConversation(sortedConversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // This feature (sending a message from the dashboard on behalf of the agent)
    // is a future enhancement. For now, this UI is read-only for conversation history.
    // The logic below is a visual mock to show how it would look.
    const assistantMessage: Message = {
      sender: 'assistant',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setSelectedConversation(prev => {
        if (!prev) return null;
        return {
            ...prev,
            messages: [...prev.messages, assistantMessage],
            last_message_at: new Date().toISOString()
        }
    });

    setNewMessage('');
    
    // In a real implementation, you would call:
    // await api.sendMessage(selectedConversation.agent_id, selectedConversation.contact_number, newMessage);
    // And then refresh the conversation list.
  };

  if (conversations.length === 0) {
      return (
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center text-dark-text-secondary h-[70vh] flex items-center justify-center">
              No conversations yet for this agent.
          </div>
      );
  }

  return (
    <div className="flex flex-col md:flex-row h-[70vh] bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-dark-border flex-shrink-0 overflow-y-auto">
        {conversations
          .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
          .map(convo => (
          <div
            key={convo.id}
            onClick={() => setSelectedConversation(convo)}
            className={`p-4 cursor-pointer border-b border-dark-border last:border-b-0 ${selectedConversation?.id === convo.id ? 'bg-brand-primary/10' : 'hover:bg-gray-900/50'}`}
          >
            <p className="font-semibold text-dark-text-primary">{convo.contact_number}</p>
            <p className="text-sm text-dark-text-secondary truncate">
              {convo.messages[convo.messages.length - 1].content}
            </p>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {new Date(convo.last_message_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {selectedConversation.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'assistant' ? 'bg-gray-700 rounded-bl-none' : 'bg-brand-secondary text-white rounded-br-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-60 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-dark-border bg-gray-900">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message as the assistant..."
                  className="flex-1 bg-dark-card border border-dark-border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary"
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