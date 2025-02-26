// src/services/messageService.ts
import api from '../config/api';
import { Message } from '../models/Message';

export const getAllMessages = async (): Promise<Message[]> => {
  const response = await api.get('/messages');
  return response.data;
};

// export const getMessageById = async (id: string): Promise<Message> => {
//   const response = await api.get(`/messages/${id}`);
//   return response.data;
// };  Not required

export const createMessage = async (messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

// export const updateMessage = async (id: string, messageData: Partial<Message>): Promise<Message> => {
//   const response = await api.put(`/messages/${id}`, messageData);
//   return response.data;
// }; Not required

// export const deleteMessage = async (id: string): Promise<void> => {
//   await api.delete(`/messages/${id}`);
// }; Not required

// Fetch messages by lead ID AND channel
export const getMessagesByChannelAndLeadId = async (leadId: string, channel: string): Promise<Message[]> => {
    const response = await api.get(`/messages/${leadId}/${channel}`);
    return response.data;
}
