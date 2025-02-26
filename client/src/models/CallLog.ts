// src/models/CallLog.ts
export interface CallLog {
    id: string;
    lead_id: string;
    twilio_call_sid: string;
    duration: number | null;
    status: 'scheduled' | 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
    recording_url: string | null;
    transcription: string | null;
    summary: string | null;
    direction: 'Inbound' | 'Outbound';
    timestamp: string; // Use string for ISO 8601 dates
}
