// src/components/messaging/WhatsAppView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bot, X, MessageCircle } from 'lucide-react';
import * as messageService from '../../services/messageService';
import { Message } from '../../models/Message';
import { Lead } from '../../models/Lead';
import Chat from './Chat';
import { io, Socket } from 'socket.io-client';

interface WhatsAppViewProps {
    theme: 'dark' | 'light';
    leads: Lead[]; // Receive leads as a prop
}

export function WhatsAppView({ theme, leads }: WhatsAppViewProps) {
    const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string; id: string; } | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    // useCallback to prevent unnecessary re-renders of fetchMessages
    const fetchMessages = useCallback(async (leadId: string) => {
        try {
            setLoading(true);
            const fetchedMessages = await messageService.getMessagesByChannelAndLeadId(leadId, 'WhatsApp');  // Fetch only whatsapp messages
            setMessages(fetchedMessages);
            setError(null); // Clear any previous errors
        } catch (err: any) {
            setError(err.message || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch messages for the selected contact when it changes
        if (selectedLead) {
            fetchMessages(selectedLead.id);
        }
    }, [selectedLead, fetchMessages]);

   useEffect(() => {
      const newSocket = io('http://localhost:3001'); // Replace with your backend URL and port
      setSocket(newSocket);
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        newSocket.on('message_received', (newMessage: Message) => {

            if (newMessage.channel === 'WhatsApp' && selectedLead && newMessage.lead_id === selectedLead.id) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedLead]); // Depend on selectedContact, so the effect runs when it changes



    const handleSendMessage = async (text: string, leadId: string, channel: string) => {
        try {
            await messageService.sendMessage(leadId, channel, text);
             // Fetch all the messages.
              fetchMessages(leadId);
        } catch (error: any) {
            console.error("Error sending message:", error);
            setError(error.message || "Failed to send message");
        }
    };

    // Function to handle contact/conversation selection
    const handleSelectLead = (lead: Lead) => {
      setSelectedLead({name: lead.name, phone: lead.phone_number, id: lead.id});
      fetchMessages(lead.id) // Fetch messages when a contact is selected
    }

    if (loading) {
        return <div>Loading WhatsApp conversations...</div>; // Display loading message
    }

    if (error) {
        return <div>Error: {error}</div>; // Display error message
    }


    return (
        <div className="h-[calc(100vh-2rem)] flex mt-16">
            {/* Quick Access Bar */}
            <div className={`fixed top-0 right-0 left-64 h-16 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-b px-8 flex items-center justify-between z-10`}>
                <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowAIPopup(true)}
                    className={`flex items-center gap-2 px-4 py-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    } rounded-lg hover:bg-opacity-80 transition-colors`}
                >
                    <Bot className="w-5 h-5 text-green-400" />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>AI Assistant</span>
                </button>
                </div>
            </div>

            {/* Contacts List */}
            <div className={`w-1/3 border-r ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-6 h-6 text-green-400" />
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>WhatsApp</h2>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className={`w-full pl-10 pr-4 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 text-white placeholder-gray-400'
                                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                            } rounded-lg focus:outline-none`}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                {/* Contacts */}
                <div className="overflow-y-auto">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`p-4 cursor-pointer ${
                      selectedLead?.id === lead.id
                        ? theme === 'dark'
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                        {lead.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {lead.name}
                        </h3>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lead.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1">
                {selectedLead ? (
                    <Chat contact={selectedLead} messages={messages} onSendMessage={handleSendMessage} theme={theme} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Select a conversation to start messaging
                        </p>
                    </div>
                )}
            </div>
            {/* AI Assistant Popup */}
            {showAIPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-green-400" />
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Ask about the data in the chat box
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAIPopup(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                    Ask AI Assistant
                                </label>
                                <textarea
                                    className={`w-full h-32 px-3 py-2 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    } border rounded-lg focus:outline-none focus:border-green-500`}
                                    placeholder="Ask about the data in the chat box..."
                                />
                            </div>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Update AI Context
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
