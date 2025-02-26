// src/services/calendarService.ts
import api from '../config/api';
import { Appointment } from '../models/Appointment';

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const response = await api.post('/calendar', appointmentData);
    return response.data;
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get('/calendar');
    return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
    const response = await api.get(`/calendar/${id}`);
    return response.data;
};

export const updateAppointment = async (id: string, updateData: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/calendar/${id}`, updateData);
    return response.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    await api.delete(`/calendar/${id}`);
};
