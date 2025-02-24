// src/models/Appointment.ts
export interface Appointment {
  id: string;
  lead_id: string;
  date_time: string;
  source: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}
