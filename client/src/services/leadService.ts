// src/services/leadService.ts
import api from '../config/api';
import { Lead } from '../models/Lead';
import { parse } from 'csv-parse/sync'; // Import synchronous version
import { Readable } from 'stream';

// Create a new lead
export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
    const response = await api.post('/leads', leadData);
    return response.data;
};

// Get all leads
export const getLeads = async (): Promise<Lead[]> => {
    const response = await api.get('/leads');
    return response.data;
};

// Get a single lead by ID
export const getLeadById = async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
};

// Update an existing lead
export const updateLead = async (id: string, updateData: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, updateData);
    return response.data;
};

// Delete a lead
export const deleteLead = async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
};

// Get a lead by phone number
export const getLeadByPhoneNumber = async (phoneNumber: string): Promise<Lead | null> => {
    try {
        const response = await api.get(`/leads?phone_number=${phoneNumber}`);
        return response.data[0] || null; // Return first lead or null
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null; // Lead not found
        }
        throw error; // Re-throw other errors
    }
};

export const getLeadByEmail = async (email: string): Promise<Lead | null> => {
    try {
        const response = await api.get(`/leads?email=${email}`);
        return response.data[0] || null; // Return the first lead or null

    } catch (error: any) {
    if (error.response && error.response.status === 404) {
            return null;
    }
     throw error;
    }
}


// Import leads from a CSV file
export const importLeads = async (file: File): Promise<number> => {

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/leads/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data.count;  // Assuming backend returns { count: number }

};
