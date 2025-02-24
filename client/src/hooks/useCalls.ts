// src/hooks/useCalls.ts
import { useState, useEffect, useCallback } from 'react';
import * as callService from '../services/callService';
import { CallLog } from '../models/CallLog';

export const useCalls = () => {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCalls = useCallback(async () => {
        try {
            setLoading(true);
            const data = await callService.getAllCallLogs();
            setCalls(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch call logs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    return { calls, loading, error, refetch: fetchCalls };
};
