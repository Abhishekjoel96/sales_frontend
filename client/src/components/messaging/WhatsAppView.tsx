//src/components/messaging/WhatsAppView.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bot, X, MessageCircle } from 'lucide-react';
import * as messageService from '../../services/messageService';
import { Message } from '../../models/Message';
import { Lead } from '../../models/Lead';
import Chat from './Chat';  // Import the Chat component
import { io, Socket } from 'socket.io-client';

interface WhatsAppViewProps {
    theme: 'dark' | 'light';
    leads: Lead[]; // Receive leads as a prop
}

export function WhatsAppView({ theme, leads }: WhatsAppViewProps) {
    const [selectedContact, setSelectedContact] = useState<{name: string, phone: string, id: string} | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Use useCallback to prevent unnecessary re-renders of fetchMessages
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
        // Fetch messages for the selected contact when it changes
        if (selectedContact) {
            fetchMessages(selectedContact.id);
        }
    }, [selectedContact, fetchMessages]);

     useEffect(() => {
      const newSocket = io('http://localhost:3001'); // Replace with your backend URL
      setSocket(newSocket);
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

         newSocket.on('message_received', (newMessage: Message) => {

             if (newMessage.channel === 'WhatsApp' && selectedContact && newMessage.lead_id === selectedContact.id) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedContact]); //Corrected dependency array.


    const handleSendMessage = async (text: string, leadId: string, channel: string)
