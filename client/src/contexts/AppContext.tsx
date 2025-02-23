// src/contexts/AppContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Lead } from '../models/Lead';
import { Appointment } from '../models/Appointment';
import { CallLog } from '../models/CallLog';
import { Message } from '../models/Message';
import { io, Socket } from 'socket.io-client';
import { AISettings } from '../models/AISettings';

interface AppContextType {
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    callLogs: CallLog[];
    setCallLogs: React.Dispatch<React.SetStateAction<CallLog[]>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isLoading: boolean;
    error: string | null;
    socket: Socket | null; // Add socket to the context
    theme: 'dark' | 'light';
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
    aiSettings: AISettings[];
    setAiSettings: React.Dispatch<React.SetStateAction<AISettings[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark'); // Example: Initial theme state
    const [aiSettings, setAiSettings] = useState<AISettings[]>([]);

    useEffect(() => {
        const newSocket = io('http://localhost:3001'); // Replace with your backend URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        // Example of handling multiple events.  Add more as needed.
        newSocket.on('lead_added', (newLead: Lead) => {
            setLeads(prevLeads => [...prevLeads, newLead]);
        });
        newSocket.on('lead_updated', (updatedLead: Lead) => {
          setLeads(prevLeads =>
            prevLeads.map((lead) =>
              lead.id === updatedLead.id ? updatedLead : lead
            )
          );
        });

        newSocket.on('lead_deleted', (deletedLeadId: string) => {
            setLeads(prevLeads => prevLeads.filter(lead => lead.id !== deletedLeadId));
        });

        newSocket.on('message_received', (newMessage: Message) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        newSocket.on('message_sent', (sentMessage: Message) => {
           setMessages(prevMessages => [...prevMessages, sentMessage]);
        });

        newSocket.on('appointment_created', (newAppointment: Appointment) => {
            setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
        });

        newSocket.on('appointment_updated', (updatedAppointment: Appointment) => {
            setAppointments(prevAppointments =>
                prevAppointments.map(appointment =>
                    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
                )
            );
        });

        newSocket.on('appointment_deleted', (deletedAppointmentId: string) => {
           setAppointments((prevAppointments) =>
             prevAppointments.filter((appointment) => appointment.id !== deletedAppointmentId)
           );
        });


        newSocket.on('call_initiated', (newCall: CallLog) => {
           setCallLogs(prevCalls => [newCall, ...prevCalls]);
        })
        newSocket.on('call_updated', (updatedCall: CallLog) => {
            setCallLogs(prevCalls =>
                prevCalls.map(call =>
                    call.id === updatedCall.id ? updatedCall : call
                )
            );
        });

        newSocket.on('call_transcribed', (updatedCall: CallLog) => {  // Assuming you send back the full updated CallLog
            setCallLogs(prevCalls =>
              prevCalls.map((call) =>
                call.id === updatedCall.id ? updatedCall: call
              )
            );
        });

        newSocket.on('dashboard_updated', (dashboardData: any) => { //Not implemented yet,
            // Handle dashboard updates.  This assumes your backend sends *all* dashboard data.
            // You'd likely have more specific state variables for different parts of the dashboard.
        });

        newSocket.on('ai_settings_updated', (updatedSettings: AISettings[])=>{
            setAiSettings(updatedSettings)
        })

        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array: only run once on mount


    const contextValue: AppContextType = {
        leads,
        setLeads,
        appointments,
        setAppointments,
        callLogs,
        setCallLogs,
        messages,
        setMessages,
        isLoading,
        error,
        socket, // Provide the socket instance
        theme,
        setTheme,
        aiSettings,
        setAiSettings
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}