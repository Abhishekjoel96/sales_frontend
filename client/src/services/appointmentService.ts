// src/services/appointmentService.ts
import api from '../config/api';
import { Appointment } from '../models/Appointment';

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments');
  return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
};

export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await api.delete(`/appointments/${id}`);
};
