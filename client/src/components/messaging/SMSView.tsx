import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import * as messageService from '../../services/messageService';
import { Message } from '../../models/Message';
import { Lead } from '../../models/Lead';

interface SMSViewProps {
  theme: 'dark' | 'light';
  leads: Lead[]; // Receive leads as a prop
}

export function SMSView({ theme, leads }: SMSViewProps) {
  const [selectedContact, setSelectedContact] = useState<{ name: string; phone: string; id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket, setMessages: setGlobalMessages } = useApp();

  // Function to fetch SMS messages for a specific lead
  const fetchMessages = useCallback(async (leadId: string) => {
    try {
      setLoading(true);
      const fetchedMessages = await messageService.getMessagesByChannelAndLeadId(leadId, 'SMS');
      setMessages(fetchedMessages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact, fetchMessages]);

  // Listen for new messages via WebSocket and update if it's for the selected contact
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage: Message) => {
      if (newMessage.channel === 'SMS' && selectedContact && newMessage.lead_id === selectedContact.id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };

    socket.on('message_received', handleMessageReceived);
    return () => {
      socket.off('message_received', handleMessageReceived);
    };
  }, [selectedContact, socket]);

  // Handle sending a message
  const handleSendMessage = async (text: string, leadId: string, channel: string) => {
    try {
      await messageService.sendMessage(leadId, channel, text);
      fetchMessages(leadId);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || 'Failed to send message');
    }
  };

  // Handle selecting a contact from the provided leads list
  const handleSelectContact = (lead: Lead) => {
    setSelectedContact({ name: lead.name, phone: lead.phone_number, id: lead.id });
    fetchMessages(lead.id);
  };

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex mt-16">
      {/* Fixed top bar for quick access */}
      <div className="fixed top-0 right-0 left-64 h-16 border-b px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAIPopup(true)}>Show AI Popup</button>
        </div>
      </div>
      {/* Sidebar for contacts */}
      <div className="flex w-1/3 flex-col border-r overflow-y-auto">
        <h2 className={`p-4 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contacts</h2>
        {leads.map(lead => (
          <div
            key={lead.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            onClick={() => handleSelectContact(lead)}
          >
            <p className="font-semibold">{lead.name}</p>
            <p className="text-sm">{lead.phone_number}</p>
          </div>
        ))}
      </div>
      {/* Main conversation area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">
          {selectedContact ? (
            messages.map(msg => (
              <div key={msg.id} className="mb-4 p-2 border-b">
                <p>{msg.content}</p>
                <p className="text-xs text-gray-500">{msg.timestamp}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a contact to view messages</p>
            </div>
          )}
        </div>
        {selectedContact && (
          <div className="p-4 border-t">
            <MessageInput onSend={(text) => handleSendMessage(text, selectedContact.id, 'SMS')} theme={theme} />
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
