// src/hooks/useWebSocket.ts
// src/hooks/useWebSocket.ts
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/Message';
import { Lead } from '../models/Lead';
import { Appointment } from '../models/Appointment';
import { CallLog } from '../models/CallLog';
import { AISettings } from '../models/AISettings';

interface WebSocketHook {
    socket: Socket | null;
    isConnected: boolean;
}

// You might want to expand this to include more event types and payloads
type WebSocketEventPayload =
    | { type: 'message_received', payload: Message }
    | { type: 'lead_added', payload: Lead }
    | { type: 'lead_updated', payload: Lead }
    | { type: 'lead_deleted', payload: { id: string } }
    | { type: 'appointment_created', payload: Appointment }
    | { type: 'appointment_updated', payload: Appointment }
    | { type: 'appointment_deleted', payload: { id: string } }
    | { type: 'call_initiated', payload: CallLog }
    | { type: 'call_updated', payload: CallLog }
    | { type: 'call_transcribed', payload: CallLog }
    | { type: 'dashboard_updated', payload: any } // Define a type for dashboard data
    | {type: 'ai_settings_updated', payload: AISettings[]};

export const useWebSocket = (
    onEvent: (event: WebSocketEventPayload) => void
): WebSocketHook => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3001'); // Replace with your backend URL

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to WebSocket');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket');
        });

        // Centralized event handling
        const eventNames = [
            'message_received', 'lead_added', 'lead_updated', 'lead_deleted',
            'appointment_created', 'appointment_updated', 'appointment_deleted',
            'call_initiated', 'call_updated', 'call_transcribed','dashboard_updated', 'ai_settings_updated'
        ];

        for (const eventName of eventNames) {
            newSocket.on(eventName, (payload: any) => {
                onEvent({ type: eventName as any, payload }); // Type assertion
            });
        }


        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [onEvent]); // Dependency on onEvent

    return { socket, isConnected };
};