import React, { useState, useEffect, useCallback } from 'react';
import * as messageService from '../../services/messageService';
import { Message } from '../../models/Message';
import { Lead } from '../../models/Lead';
import { useApp } from '../../contexts/AppContext';

interface WhatsAppViewProps {
  theme: 'dark' | 'light';
  leads: Lead[];
}

export function WhatsAppView({ theme, leads }: WhatsAppViewProps) {
  const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string; id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useApp();

  // Fetch messages for a given lead and WhatsApp channel
  const fetchMessages = useCallback(async (leadId: string) => {
    try {
      setLoading(true);
      const fetchedMessages = await messageService.getMessagesByChannelAndLeadId(leadId, 'WhatsApp');
      setMessages(fetchedMessages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchMessages(selectedLead.id);
    }
  }, [selectedLead, fetchMessages]);

  useEffect(() => {
    if (!socket) return;
    const handleMessageReceived = (newMessage: Message) => {
      if (newMessage.channel === 'WhatsApp' && selectedLead && newMessage.lead_id === selectedLead.id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };
    socket.on('message_received', handleMessageReceived);
    return () => {
      socket.off('message_received', handleMessageReceived);
    };
  }, [selectedLead, socket]);

  const handleSendMessage = async (text: string, leadId: string, channel: string) => {
    try {
      await messageService.sendMessage(leadId, channel, text);
      fetchMessages(leadId);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || 'Failed to send message');
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead({ name: lead.name, phone: lead.phone_number, id: lead.id });
    fetchMessages(lead.id);
  };

  if (loading) {
    return <div>Loading WhatsApp conversations...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex mt-16">
      {/* Quick Access Bar */}
      <div className="fixed top-0 right-0 left-64 h-16 border-b px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAIPopup(true)}>Show AI Popup</button>
        </div>
      </div>
      {/* Sidebar for leads */}
      <div className="flex w-1/3 flex-col border-r overflow-y-auto">
        <h2 className={`p-4 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leads</h2>
        {leads.map(lead => (
          <div
            key={lead.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            onClick={() => handleSelectLead(lead)}
          >
            <p className="font-semibold">{lead.name}</p>
            <p className="text-sm">{lead.phone_number}</p>
          </div>
        ))}
      </div>
      {/* Main conversation area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">
          {selectedLead ? (
            messages.map(msg => (
              <div key={msg.id} className="mb-4 p-2 border-b">
                <p>{msg.content}</p>
                <p className="text-xs text-gray-500">{msg.timestamp}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a lead to view messages</p>
            </div>
          )}
        </div>
        {selectedLead && (
          <div className="p-4 border-t">
            <MessageInput onSend={(text) => handleSendMessage(text, selectedLead.id, 'WhatsApp')} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageInputProps {
  onSend: (text: string) => void;
  theme: 'dark' | 'light';
}

function MessageInput({ onSend, theme }: MessageInputProps) {
  const [text, setText] = useState('');
  return (
    <div className="flex">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`flex-1 px-4 py-2 rounded-l-lg border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
        }`}
        placeholder="Type a message..."
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSend(text);
            setText('');
          }
        }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
