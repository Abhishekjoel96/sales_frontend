// src/hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import * as leadService from '../services/leadService';
import { Lead } from '../models/Lead';
import { useApp } from '../contexts/AppContext';

export const useLeads = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useApp();

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
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        if (socket) {
            socket.on('lead_added', (newLead: Lead) => {
                setLeads(prevLeads => [...prevLeads, newLead]);
            });

            socket.on('lead_updated', (updatedLead: Lead) => {
                setLeads(prevLeads =>
                    prevLeads.map(lead =>
                        lead.id === updatedLead.id ? updatedLead : lead
                    )
                );
            });

            socket.on('lead_deleted', (deletedLeadId: string) => {
                setLeads(prevLeads => prevLeads.filter(lead => lead.id !== deletedLeadId));
            });
        }

        return () => {
          if(socket){
            socket.off('lead_added');
            socket.off('lead_updated');
            socket.off('lead_deleted');
          }
        }
    }, [socket]);

    return { leads, loading, error, refetch: fetchLeads };
};
