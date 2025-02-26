// src/contexts/AppContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Lead } from '../models/Lead';
import { Appointment } from '../models/Appointment';
import { CallLog } from '../models/CallLog';
import { Message } from '../models/Message';
import { AISettings } from '../models/AISettings';
import * as leadService from '../services/leadService';
import * as messageService from '../services/messageService';
import * as appointmentService from '../services/appointmentService';
import * as callService from '../services/callService';


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
    socket: Socket | null;
    theme: 'dark' | 'light';
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
    aiSettings: AISettings[];
    setAiSettings: React.Dispatch<React.SetStateAction<AISettings[]>>;
    fetchData: () => Promise<void>; //For Refetching
    selectedLead: { name: string; phone: string; id: string } | null; // Add selectedLead
    selectLead: (leadId: string) => void; // Add selectLead
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

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
    const [theme, setTheme] = useState<'dark' | 'light'>('dark'); // Example: Initial theme state, you could also load from localStorage
    const [aiSettings, setAiSettings] = useState<AISettings[]>([]);
    const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string; id: string } | null>(null);

    // Initial data fetching, using useCallback for preventing rerendering.
     const fetchData = useCallback(async () => {
        setIsLoading(true)
        try{
            const fetchedLeads = await leadService.getLeads()
            setLeads(fetchedLeads);
            const fetchedAppointments = await appointmentService.getAllAppointments();
            setAppointments(fetchedAppointments);
            const fetchedCallLogs = await callService.getAllCallLogs();
            setCallLogs(fetchedCallLogs);
            // const fetchedMessages = await messageService.getAllMessages(); // Fetch *all* initial messages.
            // setMessages(fetchedMessages);

        }
        catch(error: any){
            setError(error.message || "Failed to fetch the data")
        }
        finally{
            setIsLoading(false);
        }
    }, [setLeads, setAppointments, setCallLogs]);

    useEffect(() => {
       fetchData();
    }, [fetchData]);


    useEffect(() => {
        const newSocket = io('http://localhost:3001'); // Replace with your backend URL
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        newSocket.on('message_received', (newMessage: Message) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

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

         newSocket.on('dashboard_updated', (dashboardData: any) => { //Not implemented yet
             // Handle dashboard updates.
         });

         newSocket.on('ai_settings_updated', (updatedSettings: AISettings[])=>{
            setAiSettings(updatedSettings)
         })

        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array: only run once on mount

    //Function for selecting lead
    const selectLead = (leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            setSelectedLead({ name: lead.name, phone: lead.phone_number, id: lead.id });
        } else {
            setSelectedLead(null); // Or handle the case where the lead is not found
            console.warn(`Lead with ID ${leadId} not found.`);
        }
    };

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
        socket,
        theme,
        setTheme,
        aiSettings,
        setAiSettings,
        fetchData,
        selectedLead,
        selectLead
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to access the context
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
