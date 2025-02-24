// src/services/appointmentService.ts
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    Appointment,
  } from '../models/Appointment'; //Corrected
  import { isWithinInterval, parseISO, addMinutes, subMinutes } from 'date-fns';

  export const createNewAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Appointment> => {
    return createAppointment(appointmentData);
  };

  export const getAllAppointments = async (): Promise<Appointment[]> => {
    return getAppointments();
  };

  export const getAppointment = async (id: string): Promise<Appointment> => {
    return getAppointmentById(id);
  };

  export const updateExistingAppointment = async (
    id: string,
    updateData: Partial<Omit<Appointment, 'id' | 'created_at'>>
  ): Promise<Appointment> => {
    return updateAppointment(id, updateData)
  };


  export const deleteExistingAppointment = async (id: string): Promise<void> => {
    return deleteAppointment(id);
  };
