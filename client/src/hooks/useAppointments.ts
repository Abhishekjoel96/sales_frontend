// src/hooks/useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import * as appointmentService from '../services/appointmentService';
import { Appointment } from '../models/Appointment';
import { useApp } from '../contexts/AppContext';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const { socket } = useApp();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      setAppointments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

    useEffect(() => {
        if(!socket) return;
        socket.on('appointment_created', (newAppointment: Appointment) => {
            setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
        });

        socket.on('appointment_updated', (updatedAppointment: Appointment) => {
            setAppointments(prevAppointments =>
                prevAppointments.map(appointment =>
                    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
                )
            );
        });

        socket.on('appointment_deleted', (deletedAppointmentId: string) => {
           setAppointments((prevAppointments) =>
             prevAppointments.filter((appointment) => appointment.id !== deletedAppointmentId)
           );
        });

        return () => {
          if(socket){
            socket.off('appointment_created');
            socket.off('appointment_updated');
            socket.off('appointment_deleted');
          }
        };
    }, [socket, setAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
};
