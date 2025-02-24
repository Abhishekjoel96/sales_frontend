// src/services/leadService.ts
import api from '../config/api';
import { Lead } from '../models/Lead';


export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
  const response = await api.post('/leads', leadData);
  return response.data;
};


export const getLeads = async (): Promise<Lead[]> => {
    const response = await api.get('/leads');
    return response.data;
};


export const getLeadById = async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
};


export const updateLead = async (id: string, updateData: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, updateData);
    return response.data;
};


export const deleteLead = async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
};


export const getLeadByPhoneNumber = async (phoneNumber: string): Promise<Lead | null> => {
    try {
        const response = await api.get(`/leads?phone_number=${phoneNumber}`);
        return response.data[0] || null;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null; // Lead not found
        }
        throw error;
    }
};


export const getLeadByEmail = async (email: string): Promise<Lead | null> => {
  try{
    const response = await api.get(`/leads?email=${email}`)
    return response.data[0] || null;
  } catch(error: any){
    if (error.response && error.response.status === 404) {
            return null; // Lead not found by email
        }
        throw error;
   }
}

export const importLeads = async(file: File): Promise<number> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/leads/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.count; // Assuming backend returns { count: number }

}
