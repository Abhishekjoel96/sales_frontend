// src/components/messaging/EmailView.tsx
import React from 'react';
import Chat from './Chat';
import { useApp } from '../../contexts/AppContext';
import { Loader2, Mail, Search } from 'lucide-react'; // Import icons

interface EmailViewProps {}

const EmailView: React.FC<EmailViewProps> = () => {
  const { leads, selectLead, selectedLead, isLoading, error, theme } = useApp();

  return (
     <div className={`flex h-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar - Lead List */}
      <div className={`w-1/4 border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="relative">
            <Search className={`absolute left-2 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-gray-400':'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search chats..."
              className={`pl-8 pr-2 py-2 w-full rounded-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-indigo-500`}

            />
          </div>
        </div>

        <div className="overflow-auto">
            {isLoading && <div className="flex justify-center p-4"><Loader2 className={`animate-spin h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} /></div>}
            {error && <p className="text-red-500 p-4">Error: {error}</p>}
          {!isLoading && !error && leads.length === 0 ? (
            <p className={`p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No leads found.</p>
          ) : (
            leads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => selectLead(lead.id)}
                className={`flex items-center w-full px-4 py-3 hover:bg-gray-200 text-left ${
                  selectedLead?.id === lead.id
                    ? `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`
                    : `${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                } ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}
              >
                 <Mail className={`mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <div className='truncate'>
                    {lead.name}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedLead ? (
          <Chat leadId={selectedLead.id} channel="Email" />
        ) : (
          <div className={`flex items-center justify-center h-full ${theme === 'dark'? 'bg-gray-800': ''}`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailView;
