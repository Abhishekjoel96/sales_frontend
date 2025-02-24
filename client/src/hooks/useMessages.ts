// src/hooks/useMessages.ts

import { useState, useEffect, useCallback } from 'react';
import * as messageService from '../services/messageService';
import { Message } from '../models/Message';

export const useMessages = (leadId: string, channel: string) => { // Add leadId and channel
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        // Added leadId and channel for fetching specific messages
        if (!leadId || !channel) {
          return;
        }
        try {
            setLoading(true);
            const fetchedMessages = await messageService.getMessagesByChannelAndLeadId(leadId, channel); // You'll need to implement this in messageService
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

    return { messages, loading, error, refetch: fetchMessages };
};
