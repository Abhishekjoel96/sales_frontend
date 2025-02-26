// src/services/masterAgentService.ts
import api from '../config/api';
import { MasterAgentSettings } from '../models/MasterAgentSettings'; // Assuming you have this model

export const getMasterAgentSettings = async (): Promise<MasterAgentSettings> => {
    const response = await api.get('/master-agent/settings');
    return response.data;
};

export const updateMasterAgentSettings = async (settings: MasterAgentSettings): Promise<MasterAgentSettings> => {
    const response = await api.put('/master-agent/settings', settings);
    return response.data;
};

// Combined method
export const getDashboardData = async (): Promise<any> => {
  const response = await api.get('/master-agent/dashboard');
  return response.data;
}
