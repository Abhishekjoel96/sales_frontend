// src/components/messaging/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react'; //Corrected import
import { Message } from '../../models/Message';

interface ChatProps {
  contact: { name: string; phone: string; id: string } | null;
  messages: Message[];
  onSendMessage: (text: string, leadId: string, channel: string) => void;
  theme: 'dark' | 'light';
}

function Chat({ contact, messages, onSendMessage, theme }: ChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, contact.id, 'WhatsApp'); // Now correctly passing leadId and channel
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className={`flex items-center justify-between p-4 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
            {/*  Display lead's initial */}
            {contact.name[0]}
          </div>
          <div>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</h3>
            <p className="text-sm text-gray-500">{contact.phone}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'Outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.direction === 'Outbound'
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
            }`}>
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.direction === 'Outbound' ? 'text-blue-200' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Invisible element at the end of messages (for auto-scroll) */}
      </div>

      {/* Message Input */}
      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          {/* Remove the attachment option if it's SMSView*/}
          {/*
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Paperclip className="w-6 h-6 text-gray-400" />
          </button>
            */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className={`flex-1 px-4 py-2 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            } rounded-lg focus:outline-none`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  handleSend();
                }
              }}
          />
          <button
            onClick={handleSend}
            className={`p-2 rounded-full ${
              message.trim()
                ? 'bg-blue-600 hover:bg-blue-700'
                : theme === 'dark'
                ? 'bg-gray-700'
                : 'bg-gray-100'
            }`}
          >
            <Send className={`w-6 h-6 ${message.trim() ? 'text-white' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
