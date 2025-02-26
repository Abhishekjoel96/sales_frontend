// src/services/aiService.ts
import api from '../config/api';
import { AISettings } from '../models/AISettings';

export const getAISettings = async (): Promise<AISettings> => {
  const response = await api.get('/ai/settings');
  return response.data;
};

export const updateAISettings = async (settings: AISettings): Promise<AISettings> => {
    const response = await api.put('/ai/settings', settings);
    return response.data;
};

export const getAvailableModels = async (): Promise<string[]> => {
    const response = await api.get('/ai/models');
    return response.data;
};

export const getChannelPrompts = async (): Promise<{ [key: string]: string }> => {
  const response = await api.get('/ai/channel-prompts');
  return response.data;
}

export const updateChannelPrompt = async (channel: string, prompt: string): Promise<void> => {
    await api.put(`/ai/channel-prompts/${channel}`, { prompt });
};
