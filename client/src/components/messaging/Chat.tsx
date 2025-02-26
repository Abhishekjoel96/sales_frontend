// src/components/messaging/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../models/Message';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { Send, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ChatProps {
  leadId: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
}

function Chat({ leadId, channel }: ChatProps) {
  const { messages, sendMessage, isLoading, error, selectedLead, theme } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages]);


  useEffect(() => {
    setInputMessage(''); // Clear input when lead changes
  }, [leadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      await sendMessage(leadId, inputMessage, channel);
      setInputMessage('');
    }
  };

  const filteredMessages = messages.filter(
    (msg) => msg.lead_id === leadId && msg.channel === channel
  );


  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Chat Header */}
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        {selectedLead ? (
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-semibold">{selectedLead.name}</h2>
          </div>
        ) : (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No lead selected</p>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin h-5 w-5" /></div>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && filteredMessages.length === 0 && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No messages yet.</p>
        )}

        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? `${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-900'}`
                  : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
            >
                <p>{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {format(new Date(message.timestamp), 'p')}
                    </span>
                  {message.sender === 'user' && (
                      <>
                      {message.status === 'sent' && <CheckCircle className="h-4 w-4 text-gray-500"/>}
                      {message.status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-500"/>}
                      {message.status === 'read' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      {message.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      </>

                    )}
                </div>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
        <form onSubmit={handleSendMessage} className={`border-t p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-3 py-2 rounded-lg mr-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            disabled={!selectedLead}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50`}
            disabled={!selectedLead}
          >
             <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
