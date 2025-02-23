// src/hooks/useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import * as calendarService from '../services/calendarService';
import { Appointment } from '../models/Appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await calendarService.getAllAppointments();
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

  return { appointments, loading, error, refetch: fetchAppointments };
};