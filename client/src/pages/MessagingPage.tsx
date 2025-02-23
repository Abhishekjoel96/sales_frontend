// src/pages/MessagingPage.tsx
import React, { useState } from 'react';
import { WhatsAppView } from '../components/messaging/WhatsAppView';
import { SMSView } from '../components/messaging/SMSView';
import { EmailView } from '../components/messaging/EmailView';
import { useApp } from '../contexts/AppContext';

const MessagingPage: React.FC = () => {
    const [activeChannel, setActiveChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
    const { theme, leads } = useApp();

    return (
        <>
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveChannel('WhatsApp')}
                    className={`px-4 py-2 ${activeChannel === 'WhatsApp' ? 'bg-indigo-600 text-white' : 'text-gray-400'} rounded-t-lg`}
                >
                    WhatsApp
                </button>
                <button
                    onClick={() => setActiveChannel('SMS')}
                    className={`px-4 py-2 ${activeChannel === 'SMS' ? 'bg-indigo-600 text-white' : 'text-gray-400'} rounded-t-lg`}
                >
                    SMS
                </button>
                <button
                    onClick={() => setActiveChannel('Email')}
                    className={`px-4 py-2 ${activeChannel === 'Email' ? 'bg-indigo-600 text-white' : 'text-gray-400'} rounded-t-lg`}
                >
                    Email
                </button>
            </div>

            {activeChannel === 'WhatsApp' && <WhatsAppView theme={theme} leads={leads} />}
            {activeChannel === 'SMS' && <SMSView theme={theme} leads={leads} />}
            {activeChannel === 'Email' && <EmailView theme={theme} leads={leads}/>}
        </>
    );
};

export default MessagingPage;