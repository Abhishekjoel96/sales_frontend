// src/services/messageService.ts
import api from '../config/api';
import { Message } from '../models/Message';

export const sendMessage = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', messageContent: string): Promise<Message> => {
    const response = await api.post('/messages/send', { leadId, channel, content: messageContent });
    return response.data;
};

//Gets the messages by channel and lead id
export const getMessagesByChannelAndLeadId = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email'): Promise<Message[]> => {
    const response = await api.get(`/messages?lead_id=${leadId}&channel=${channel}`);
    return response.data;
}

export const getAllMessages = async (): Promise<Message[]> => {
  const response = await api.get('/messages');
  return response.data
}
export const getMessage = async(id: string): Promise<Message> => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
}