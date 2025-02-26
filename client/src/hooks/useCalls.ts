// src/hooks/useCalls.ts
import { useState, useEffect, useCallback } from 'react';
import * as callService from '../services/callService';
import { CallLog } from '../models/CallLog';
import { useApp } from '../contexts/AppContext';

export const useCalls = () => {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
     const { socket } = useApp(); // Access the socket from the context


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

     useEffect(() => {
        if(!socket) return;
        socket.on('call_initiated', (newCall: CallLog) => {
            setCalls(prevCalls => [newCall, ...prevCalls]);
         })
        socket.on('call_updated', (updatedCall: CallLog) => {
            setCalls(prevCalls =>
                prevCalls.map(call =>
                    call.id === updatedCall.id ? updatedCall : call
                )
            );
        });

         socket.on('call_transcribed', (updatedCall: CallLog) => {  // Assuming you send back the full updated CallLog
             setCalls(prevCalls =>
               prevCalls.map((call) =>
                 call.id === updatedCall.id ? updatedCall: call
               )
             );
         });


        return () => {
          if(socket){
            socket.off('call_initiated')
            socket.off('call_updated')
            socket.off('call_transcribed')
          }
        };
    }, [socket, setCalls]); // Add setCalls to the dependency array

    return { calls, loading, error, refetch: fetchCalls };
};
