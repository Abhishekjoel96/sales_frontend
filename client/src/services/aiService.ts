// src/services/aiService.ts
import api from '../config/api';

export const getRagData = async(query: string): Promise<string> => {
    const response = await api.post('/ai/assistant', {query});
    return response.data.response; // Assuming backend returns { response: string }
}

export const getDashboardData = async(): Promise<any> => { // Replace 'any' with a proper interface
  const response = await api.get('/ai/dashboard');
  return response.data;
}
