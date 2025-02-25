// src/components/FineTuneView.tsx
import React, { useState } from 'react';
import { MessageCircle, MessagesSquare, Mail, PhoneCall } from 'lucide-react';

interface ChannelConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    context: string;
    tone: string;
    style: string;
    enabled: boolean;
}
const defaultContexts = {
  'WhatsApp': `You are a helpful and friendly AI assistant for BusinessOn.ai. Your primary goal is to qualify leads and book appointments for consultations.
                Address the person using name if provided.
                Keep the conversation short and engaging, don't make the client bore.
                Ask one question at a time.
                If the lead is not looking for the appointment booking, try to convince.
                `,
  'SMS': `You are a concise and professional AI assistant for BusinessOn.ai. Focus on scheduling appointments and providing brief information.
          Address the person using name if provided.
          Keep the conversation short and engaging, don't make the client bore.
          Ask one question at a time.
          If the lead is not looking for the appointment booking, try to convince.`,

  'Email': `You are a formal and detailed AI assistant for BusinessOn.ai. Provide comprehensive information and assist with scheduling consultations.
            Address the person using name if provided.
            Keep the conversation short and engaging, don't make the client bore.
            Ask one question at a time.
            If the lead is not looking for the appointment booking, try to convince.`,
  'Call': `You are a helpful and efficient AI phone agent for BusinessOn.ai.  Your main task is to qualify leads and book appointments.
            Greet the person.
            Introduce yourself.
            Ask for language preference.
            Speak in the selected language.
            Keep the conversation short and engaging, don't make the client bore.
            Ask one question at a time.
            If the lead is not looking for the appointment booking, try to convince.`
};

export function FineTuneView({ theme }: { theme: 'dark' | 'light' }) {
  const [channels, setChannels] = useState<ChannelConfig[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-6 h-6" />,
      context: defaultContexts['WhatsApp'],
      tone: 'friendly',
      style: 'concise',
      enabled: true
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <MessagesSquare className="w-6 h-6" />,
      context: defaultContexts['SMS'],
      tone: 'professional',
      style: 'concise',
      enabled: true
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-6 h-6" />,
      context: defaultContexts['Email'],
      tone: 'formal',
      style: 'detailed',
      enabled: true
    },
      {
      id: 'call',
      name: 'Call',
      icon: <PhoneCall className="w-6 h-6" />,
      context: defaultContexts['Call'],
      tone: 'professional',
      style: 'concise',
      enabled: true
    }
  ]);

    const handleContextChange = (channelId: string, value: string) => {
        setChannels(channels.map(channel =>
            channel.id === channelId ? { ...channel, context: value } : channel
        ));
    };

    const handleToneChange = (channelId: string, value: string) => {
        setChannels(channels.map(channel =>
            channel.id === channelId ? { ...channel, tone: value } : channel
        ));
    };

    const handleStyleChange = (channelId: string, value: string) => {
        setChannels(channels.map(channel =>
            channel.id === channelId ? { ...channel, style: value } : channel
        ));
    };
     const handleToggleChannel = (channelId: string) => {
        setChannels(channels.map((channel) =>
          channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
        ));
      };


  return (
    <>
      <header className="mb-8">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Fine-tune AI
        </h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Customize AI behavior for each communication channel
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {channels.map(channel => (
          <div
            key={channel.id}
            className={`${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-lg shadow-lg p-6 border`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={channel.icon && channel.icon.props && channel.icon.props.className ? channel.icon.props.className : ''} >{channel.icon}</div>
                </div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {channel.name}
                </h3>
              </div>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={channel.enabled}
                    onChange={() => handleToggleChannel(channel.id)}
                    className="sr-only peer"
                  />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                  Context & Guidelines
                </label>
                <textarea
                  value={channel.context}
                  onChange={(e) => handleContextChange(channel.id, e.target.value)}
                  className={`w-full h-32 px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                  placeholder={`Add specific instructions or context for ${channel.name} interactions...`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                    Communication Tone
                  </label>
                  <select
                    value={channel.tone}
                    onChange={(e) => handleToneChange(channel.id, e.target.value)}
                    className={`w-full px-3 py-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } border rounded-lg focus:outline-none focus:border-indigo-500`}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                    Writing Style
                  </label>
                  <select
                    value={channel.style}
                    onChange={(e) => handleStyleChange(channel.id, e.target.value)}
                    className={`w-full px-3 py-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } border rounded-lg focus:outline-none focus:border-indigo-500`}
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="engaging">Engaging</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
