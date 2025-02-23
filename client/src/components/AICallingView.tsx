// src/components/AICallingView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PhoneIncoming, PhoneOutgoing, Phone, Plus, Filter, ArrowUpDown, X, FileText } from 'lucide-react';
import { AnimatedCard } from './shared/AnimatedCard';
import { CallLog } from '../models/CallLog'; // Import CallLog
import * as callService from '../services/callService'; // Import callService
import { format } from 'date-fns';
import { Lead } from '../models/Lead';


interface AICallingViewProps {
    theme: 'dark' | 'light';
    leads: Lead[]; // To select the leads.
}

interface CallItemProps {
    name: string;
    number: string;
    time: string;
    status: string;
    type: string;
    theme: 'dark' | 'light';
}

function CallItem({ name, number, time, status, type, theme }: CallItemProps) {
    const statusColor =
        status === 'completed' ? 'text-green-400' :
            status === 'failed' || status === 'no_answer' || status === 'busy' ? 'text-red-400' :
                status === 'ringing' ? 'text-yellow-400' :
                    'text-gray-400';

    return (
        <div className={`flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border  hover:border-indigo-500/50 transition-all duration-300`}>
            <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{number}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{time}</p>
            </div>
            <div className="text-right">
                <p className={`font-medium ${statusColor}`}>{status}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{type}</p>
            </div>
        </div>
    );
}

interface ScheduleCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[]; // Pass leads to the modal
    onCallScheduled: (callLog: CallLog) => void; // Callback for successful scheduling
    theme: 'dark' | 'light';
}

function ScheduleCallModal({ isOpen, onClose, leads, onCallScheduled, theme }: ScheduleCallModalProps) {
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // Default language
    const [scheduling, setScheduling] = useState(false); // Loading state
    const [error, setError] = useState<string | null>(null);


    if (!isOpen) return null;

    const handleScheduleCall = async () => {
        try {
            setScheduling(true);
            setError(null);
            if (!selectedLeadId || !selectedDate || !selectedTime) {
                throw new Error("Please fill in all fields.");
            }

            const lead = leads.find((lead) => lead.id === selectedLeadId);
            if (!lead) {
                throw new Error("Selected lead not found.");
            }

            //Combine date and time
            const dateTimeStr = `<span class="math-inline">\{selectedDate\}T</span>{selectedTime}:00`;

            const newCall = await callService.makeCall(lead.phone_number, lead.id, selectedLanguage); //Added a function in call service
            onCallScheduled(newCall);  //Update the parent
            onClose(); // Close modal

        } catch (error: any) {
            setError(error.message || "Failed to schedule call.");
        } finally {
            setScheduling(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Schedule AI Call
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Select Lead
                        </label>
                        <select
                            value={selectedLeadId}
                            onChange={(e) => setSelectedLeadId(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        >
                            <option value="">Select a Lead</option>
                            {leads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.name} ({lead.phone_number})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Time
                        </label>
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Language
                        </label>
                         <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-full px-3 py-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:border-indigo-500`}
              >
                <option value="en-US">English</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="es-ES">Spanish</option>
                <option value="it-IT">Italian</option>
              </select>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                        } text-gray-400 rounded-lg transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleScheduleCall}
                        disabled={scheduling}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {scheduling ? 'Scheduling...' : 'Schedule Call'}
                    </button>
                </div>
            </div>
        </div>
    );
}


export function AICallingView({ theme, leads }: AICallingViewProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'reports'>('current');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  // Using useCallback to prevent unnecessary re-creations of fetchCallLogs
  const fetchCallLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logs = await callService.getAllCallLogs();
      setCallLogs(logs);
      setError(null); // Clear errors on successful fetch
    } catch (err: any) {
      setError(err.message || "Failed to fetch call logs");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function never changes

    // Fetch call logs when component mounts, using useCallback function
    useEffect(() => {
      fetchCallLogs();
  }, [fetchCallLogs]);

  const handleCallScheduled = (newCall: CallLog) => {
    // Add to the UI
    setCallLogs(prevCalls => [newCall, ...prevCalls]);
  }


    return (
        <>
            <header className="mb-8">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    AI Calling Dashboard
                </h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Monitor and manage AI-powered calls
                </p>
            </header>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'current'
                        ? 'bg-indigo-600 text-white'
                        : theme === 'dark'
                            ? 'text-gray-400 hover:bg-gray-800'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Phone className="w-4 h-4" />
                    <span>Current Calls</span>
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'reports'
                        ? 'bg-indigo-600 text-white'
                        : theme === 'dark'
                            ? 'text-gray-400 hover:bg-gray-800'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Call Reports</span>
                </button>
            </div>
            {loading ? (     //Loading state
              <div>Loading...</div>
            ) : error ? (
              <div>Error: {error}</div>
            ) : (
            activeTab === 'current' ? (
                <>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Schedule Call</span>
                        </button>
                    </div>
                   {/*  Quick stats will be implemented later */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <AnimatedCard delay={0.1}>
                        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700': 'bg-white border-gray-200'} rounded-lg p-6 border`}>

                            </div>
                        </AnimatedCard>
                    </div>

                    {/* Call Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Incoming Calls */}
                        <AnimatedCard delay={0.5}>
                        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PhoneIncoming className="w-5 h-5 text-green-400" />
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Incoming Calls</h3>
                  </div>
                  </div>
                <div className="space-y-4">
                {/* Placeholder data. Replace with dynamic data. */}
                  <CallItem
                    name="Sarah Johnson"
                    number="+1 (555) 234-5678"
                    time="2 minutes ago"
                    status="completed"
                    type="incoming"
                    theme={theme}
                  />
                  <CallItem
                    name="Mike Wilson"
                    number="+1 (555) 876-5432"
                    time="15 minutes ago"
                    status="missed"
                    type="incoming"
                    theme={theme}
                  />
                </div>
              </div>
                        </AnimatedCard>

                        {/* Outgoing Calls */}
                        <AnimatedCard delay={0.6}>
                        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PhoneOutgoing className="w-5 h-5 text-blue-400" />
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Outgoing Calls</h3>
                  </div>
                </div>
                <div className="space-y-4">
                {/* Placeholder data. Replace with dynamic data. */}
                  <CallItem
                    name="Robert Brown"
                    number="+1 (555) 345-6789"
                    time="5 minutes ago"
                    status="completed"
                    type="outgoing"
                    theme={theme}
                  />
                  <CallItem
                    name="Emily Davis"
                    number="+1 (555) 987-1234"
                    time="30 minutes ago"
                    status="no_answer"
                    type="outgoing"
                    theme={theme}
                  />
                </div>
              </div>
                        </AnimatedCard>
                    </div>
                </>
            ) : (
                //  Implement CallReportView component to show call reports.
              <div> Call Reports </div>
            ))}

            <ScheduleCallModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onCallScheduled={handleCallScheduled}
                leads={leads} // Pass the leads to the modal
                theme={theme}
            />

        </>
    );
}
