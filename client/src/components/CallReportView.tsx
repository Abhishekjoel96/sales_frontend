// src/components/CallReportView.tsx
import React from 'react';
import { CallLog } from '../models/CallLog';
import { Lead } from '../models/Lead';

interface CallReportViewProps {
  theme: 'dark' | 'light';
  callLogs: CallLog[];
  leads: Lead[];
}
export function CallReportView({ theme, callLogs, leads }: CallReportViewProps) {

  // Function to get Lead name by ID
  const getLeadName = (leadId: string) => {
    const lead = leads.find(lead => lead.id === leadId);
    return lead ? lead.name : 'Unknown Lead';
  };
  const getLeadPhoneNumber = (leadId: string) => {
    const lead = leads.find(lead => lead.id === leadId);
    return lead ? lead.phone_number : 'Unknown';
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-4`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Call Reports</h2>
      {callLogs.length === 0 ? (
        <p>No call reports available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700': 'divide-gray-200'}`}>
            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Lead
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Phone Number
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Date & Time
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Duration
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Transcription
                </th>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300 uppercase' : 'text-gray-500 uppercase'} tracking-wider`}>
                  Summary
                </th>

              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
              {callLogs.map((log) => (
                <tr key={log.id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getLeadName(log.lead_id)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                   {getLeadPhoneNumber(log.lead_id)}
                </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {log.duration ? `${Math.floor(log.duration / 60)}m ${log.duration % 60}s` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {log.status}
                  </td>
                  <td className="px-6 py-4">
                    {/* Display transcription (consider adding a modal for longer transcripts) */}
                    {log.transcription ? (
                      <details>
                        <summary>Show Transcription</summary>
                        <p>{log.transcription}</p>
                      </details>
                    ) : (
                      'No transcription'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {/* Display summary */}
                    {log.summary ? (
                      <p>{log.summary}</p>
                    ) : (
                      'No summary available'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
