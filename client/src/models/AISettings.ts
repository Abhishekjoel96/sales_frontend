// src/models/AISettings.ts

export interface AISettings {
    id: string;
    channel: 'WhatsApp' | 'SMS' | 'Email' | 'Call';
    context: string | null;
    tone: 'Formal' | 'Informal' | 'Friendly' | 'Professional';
    style: 'Concise' | 'Detailed' | 'Short' | 'Medium';
    updated_at: string;
}
