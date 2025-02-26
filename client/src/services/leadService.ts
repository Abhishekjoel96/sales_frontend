// src/services/leadService.ts
import api from '../config/api';
import { Lead } from '../models/Lead';

export const getLeads = async (): Promise<Lead[]> => {
  const response = await api.get('/leads');
  return response.data;
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
  const response = await api.post('/leads', leadData);
  return response.data;
};

export const updateLead = async (id: string, leadData: Partial<Lead>): Promise<Lead> => {
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};
