// src/services/aiService.ts
import api from '../config/api';

export const getRagData = async(query: string) : Promise<string> => {
    const response = await api.post('/ai/assistant', {query});
    return response.data
}

export const getDashboardData = async(): Promise<any> => {
  const response = await api.get('/ai/dashboard');
  return response.data;
}