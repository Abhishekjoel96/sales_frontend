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
  WhatsApp: `You are a helpful and friendly AI assistant for BusinessOn.ai. Your primary goal is to qualify leads and book appointments for consultations.
                Address the person using name if provided.
                Keep the conversation short and engaging, don't make the client bore.
                Ask one question at a time.
                If the lead is not looking for the appointment booking, try to convince.`,
  SMS: `You are a concise and professional AI assistant for BusinessOn.ai. Focus on scheduling appointments and providing brief information.
          Address the person using name if provided.
          Keep the conversation short and engaging, don't make the client bore.
          Ask one question at a time.
          If the lead is not looking for the appointment booking, try to convince.`,
  Email: `You are a formal and detailed AI assistant for BusinessOn.ai. Provide comprehensive information and assist with scheduling consultations.
            Address the person using name if provided.
            Keep the conversation short and engaging, don't make the client bore.
            Ask one question at a time.
            If the lead is not looking for the appointment booking, try to convince.`,
  Call: `You are a helpful and efficient AI phone agent for BusinessOn.ai. Your main task is to qualify leads and book appointments.
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
      context: defaultContexts.WhatsApp,
      tone: 'friendly',
      style: 'concise',
      enabled: true
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <MessagesSquare className="w-6 h-6" />,
      context: defaultContexts.SMS,
      tone: 'professional',
      style: 'concise',
      enabled: true
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-6 h-6" />,
      context: defaultContexts.Email,
      tone: 'formal',
      style: 'detailed',
      enabled: true
    },
    {
      id: 'call',
      name: 'Call',
      icon: <PhoneCall className="w-6 h-6" />,
      context: defaultContexts.Call,
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

  const toggleChannelEnabled = (channelId: string) => {
    setChannels(channels.map(channel =>
      channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">Fine Tune AI Settings</h1>
      <div className="space-y-6">
        {channels.map((channel) => (
          <div key={channel.id} className="border p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>{channel.icon}</div>
              <div>
                <h2 className="font-semibold">{channel.name}</h2>
                <p className="text-sm">Tone: {channel.tone}</p>
                <p className="text-sm">Style: {channel.style}</p>
                <p className="text-sm">Context: {channel.context.substring(0, 60)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleChannelEnabled(channel.id)}
                className={`px-3 py-1 rounded-lg ${channel.enabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {channel.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
