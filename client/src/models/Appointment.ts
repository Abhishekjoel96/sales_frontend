// src/models/Appointment.ts
export interface Appointment {
    id: string;
    lead_id: string;
    date_time: string; // Use string for ISO 8601 dates
    source: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    created_at: string;
    updated_at: string;
  }
