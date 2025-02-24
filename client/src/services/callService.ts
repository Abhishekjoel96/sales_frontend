// src/services/callService.ts
import api from '../config/api';
import { CallLog } from '../models/CallLog';

export const makeCall = async (to: string, leadId: string, language: string): Promise<CallLog> => {
    const response = await api.post('/calls/makeCall', { to, leadId, language });
    return response.data;
};

export const getAllCallLogs = async (): Promise<CallLog[]> => {
    const response = await api.get('/calls/callLogs'); // Correct endpoint
    return response.data;
}

export const getCallLog = async(id: string): Promise<CallLog> => {
    const response = await api.get(`/calls/callLogs/${id}`); // Correct endpoint
    return response.data;
}
//No need of transcribing in frontend
