// src/hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import * as leadService from '../services/leadService';
import { Lead } from '../models/Lead';

export const useLeads = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const data = await leadService.getLeads();
            setLeads(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }, []); // Add getLeads to the dependency array

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    return { leads, loading, error, refetch: fetchLeads };
};
