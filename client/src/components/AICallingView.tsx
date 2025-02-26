// src/components/AICallingView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PhoneIncoming, PhoneOutgoing, Phone, Plus, FileText, Clock, User, Calendar } from 'lucide-react';
import { AnimatedCard } from './shared/AnimatedCard';
import { CallLog } from '../models/CallLog';
import * as callService from '../services/callService';
import { format } from 'date-fns';
import { Lead } from '../models/Lead';
import { useApp } from '../contexts/AppContext';

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
  const { callLogs, isLoading: isCallLogsLoading, error: callLogsError } = useApp();

  const handleCallScheduled = (newCall: CallLog) => {
    // setCallLogs is removed, as context will handle
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

      {activeTab === 'current' ? (
        <>
          {/* Quick Stats */}
          <div className="flex justify-end mb-6">

            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Call</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* These are placeholders. You would fetch real data and populate these. */}
            <AnimatedCard delay={0.1}>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border group hover:border-indigo-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                  <Phone className="w-6 h-6 text-indigo-400" />
                  <span className="text-green-400 text-sm">+12%</span>
                </div>
                <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Calls</h3>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1,284</p>
              </div>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border group hover:border-indigo-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <span className="text-green-400 text-sm">+5%</span>
                </div>
                <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Duration</h3>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>4m 32s</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border group hover:border-indigo-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                  <User className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 text-sm">+8%</span>
                </div>
                <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Connected Rate</h3>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>68%</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.4}>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border group hover:border-indigo-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <span className="text-green-400 text-sm">+15%</span>
                </div>
                <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Conversion Rate</h3>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>23%</p>
              </div>
            </AnimatedCard>
          </div>

          {/* Call Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incoming Calls */}
            <AnimatedCard delay={0.5}>
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Incoming Calls</h3>
                  <PhoneIncoming className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                </div>
                 {/* Placeholder for incoming calls list - You'll fetch and display actual data here */}
                <div className="space-y-4">
                    {/* Example Call Item */}
                    <CallItem
                        name="John Doe"
                        number="(555) 123-4567"
                        time="2:34 PM"
                        status="completed"
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
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Outgoing Calls</h3>
                  <PhoneOutgoing className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                 {/* Placeholder for outgoing calls list - You'll fetch and display actual data here */}
                 <div className="space-y-4">
                    {/* Example Call Item */}
                    <CallItem
                        name="Jane Smith"
                        number="(555) 987-6543"
                        time="10:15 AM"
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
        // Call Reports Tab
        <div className="overflow-x-auto">
           {isCallLogsLoading ? (
                <div>Loading call logs...</div>
            ) : callLogsError ? (
                <div>Error: {callLogsError}</div>
            ) : (
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <tr>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Lead
                            </th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Phone Number
                            </th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Date & Time
                            </th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Duration
                            </th>
                             <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Status
                             </th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Transcription
                            </th>
                        </tr>
                    </thead>
                     <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                        {callLogs.map((log) => {
                            const lead = leads.find((lead) => lead.id === log.lead_id);
                            const leadName = lead ? lead.name : 'Unknown Lead';
                            const leadPhoneNumber = lead ? lead.phone_number : 'Unknown';
                            return(

                            <tr key={log.id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {leadName}
                                </td>
                                 <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {leadPhoneNumber}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {format(new Date(log.timestamp), 'Pp')}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                   {log.duration ? `${Math.floor(log.duration / 60)}m ${log.duration % 60}s` : 'N/A'}
                                </td>
                                 <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {log.status}
                                </td>
                                <td className="px-6 py-4">
                                    {log.transcription ? (
                                      <details>
                                        <summary className='cursor-pointer'>Show Transcription</summary>
                                        <p>{log.transcription}</p>
                                      </details>
                                    ) : (
                                      'No transcription'
                                    )}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
      )}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        leads={leads}
        onCallScheduled={handleCallScheduled}
        theme={theme}
      />
    </>
    );
}
