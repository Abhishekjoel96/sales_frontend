// src/models/Lead.ts
export interface Lead {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
    region: string | null;
    source: string;
    status: 'New' | 'Cold' | 'Warm' | 'Hot';
    company: string | null;
    industry: string | null;
    created_at: string;
    updated_at: string;
}
