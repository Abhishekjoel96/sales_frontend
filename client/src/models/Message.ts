// src/models/Message.ts
export interface Message {
    id: string;
    lead_id: string;
    channel: 'WhatsApp' | 'SMS' | 'Email';
    direction: 'Inbound' | 'Outbound';
    content: string;
    timestamp: string; // Use string for ISO 8601 dates
}
