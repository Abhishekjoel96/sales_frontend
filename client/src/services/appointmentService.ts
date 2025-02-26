// src/services/callService.ts
import api from '../config/api';
import { CallLog } from '../models/CallLog';

export const getAllCallLogs = async (): Promise<CallLog[]> => {
    const response = await api.get('/calls');
    return response.data;
};

export const getCallLogById = async (id: string): Promise<CallLog> => {
    const response = await api.get(`/calls/${id}`);
    return response.data;
};

// Not used for now
// export const createCallLog = async (callData: Omit<CallLog, 'id' | 'created_at' | 'updated_at'>): Promise<CallLog> => {
//   const response = await api.post('/calls', callData);
//   return response.data;
// }

export const updateCallLog = async (id: string, callData: Partial<CallLog>): Promise<CallLog> => {
    const response = await api.patch(`/calls/${id}`, callData);
    return response.data;
};

// Initiate a call
export const makeCall = async (phoneNumber: string, leadId: string, language: string): Promise<CallLog> => {
    const response = await api.post('/calls/initiate', { phone_number: phoneNumber, lead_id: leadId, language });
    return response.data;
};
