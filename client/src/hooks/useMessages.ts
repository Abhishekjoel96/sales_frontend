// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import * as messageService from '../services/messageService';
import { Message } from '../models/Message';
import { useApp } from '../contexts/AppContext';

export const useMessages = (leadId: string, channel: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useApp();


    const fetchMessages = useCallback(async () => {
      if (!leadId || !channel) {
        return;
      }
        try {
            setLoading(true);
            const fetchedMessages = await messageService.getMessagesByChannelAndLeadId(leadId, channel);
            setMessages(fetchedMessages);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [leadId, channel]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

     useEffect(() => {
        if (!socket) return;

        const handleMessageReceived = (newMessage: Message) => {
          if (newMessage.channel === channel && newMessage.lead_id === leadId) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        };

        socket.on('message_received', handleMessageReceived);

        return () => {
            socket.off('message_received', handleMessageReceived);
        };
    }, [socket, leadId, channel, setMessages]);


    return { messages, loading, error, refetch: fetchMessages };
};
