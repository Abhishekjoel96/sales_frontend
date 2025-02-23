// backend/src/services/appointmentService.ts
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    Appointment,
  } from '../models/Appointment';
  import { isWithinInterval, parseISO, addMinutes, subMinutes } from 'date-fns';

  export const createNewAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Appointment> => {
    await checkDoubleBooking(appointmentData.lead_id, appointmentData.date_time);
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
    if (updateData.date_time || updateData.lead_id) {
      // Fetch existing appointment first to get current lead_id
      const existingAppointment = await getAppointmentById(id);

      // Construct new data for double-booking check.  Use updated values if present, otherwise existing values.
      const checkData = {
          lead_id: updateData.lead_id ?? existingAppointment.lead_id,
          date_time: updateData.date_time ?? existingAppointment.date_time
      };

      await checkDoubleBooking(checkData.lead_id, checkData.date_time, id); // Pass the current appointment ID
  }
    return updateAppointment(id, updateData);
  };


  export const deleteExistingAppointment = async (id: string): Promise<void> => {
    return deleteAppointment(id);
  };


  // Centralized double-booking check
const checkDoubleBooking = async (leadId: string, dateTimeString: string, currentAppointmentId?: string) => {
    const appointments = await getAppointments();

    const newDateTime = parseISO(dateTimeString);

    const isDoubleBooked = appointments.some(appointment => {
      if (currentAppointmentId && appointment.id === currentAppointmentId) {
        return false; // Don't check against itself
      }
        if(appointment.lead_id === leadId) {
          return true; // Lead already have a existing appointment
        }
        return false;
    });

    if (isDoubleBooked) {
      throw new Error('Appointment overlaps with existing appointment.');
    }
  };
