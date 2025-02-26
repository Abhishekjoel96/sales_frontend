// src/components/FineTuneView.tsx

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext'; // Make sure this context is correct
import * as aiService from '../services/aiService';
import { Slider, Check, X, Loader2, AlertTriangle } from 'lucide-react';

interface FineTuneViewProps {}

const FineTuneView: React.FC<FineTuneViewProps> = () => {
    const { theme } = useApp();
    const [temperature, setTemperature] = useState(0.5);  // Example value
    const [topP, setTopP] = useState(0.9); // Example Value
    const [maxTokens, setMaxTokens] = useState(500);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [prompt, setPrompt] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const [channelPrompts, setChannelPrompts] = useState<{ [key: string]: string }>({
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
        'Call': `You are a helpful and efficient AI phone agent for BusinessOn.ai.  Your main task is to qualify leads and book appointments.
            Greet the person.
            Introduce yourself.
            Ask for language preference.
            Speak in the selected language.
            Keep the conversation short and engaging, don't make the client bore.
            Ask one question at a time.
            If the lead is not looking for the appointment booking, try to convince.`
    });
    const [selectedChannel, setSelectedChannel] = useState('WhatsApp');



      // Fetch settings and available models on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const settings = await aiService.getAISettings();
                const models = await aiService.getAvailableModels();
                const prompts = await aiService.getChannelPrompts();


                //Set States
                setTemperature(settings.temperature);
                setTopP(settings.top_p);
                setMaxTokens(settings.max_tokens);
                setFrequencyPenalty(settings.frequency_penalty);
                setPresencePenalty(settings.presence_penalty);
                setModel(settings.model);
                if (prompts) {
                    setChannelPrompts(prompts);
                }

                setAvailableModels(models);

                setError(null); // Clear any previous errors
            } catch (err : any) {
                setError(err.message || "Failed to fetch settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            setSuccess(false);
            setError(null);

            const settings = {
                temperature,
                top_p: topP,
                max_tokens: maxTokens,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty,
                model
            }

            await aiService.updateAISettings(settings);
            await aiService.updateChannelPrompt(selectedChannel, channelPrompts[selectedChannel]); // Save individual prompt
            setSuccess(true);
            setTimeout(()=> setSuccess(false), 3000); // Clear success message

        } catch (error: any) {
             setError(error.message || 'Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleChannelChange = (channel: string) => {
      setSelectedChannel(channel);
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setChannelPrompts({
            ...channelPrompts,
            [selectedChannel]: e.target.value
        });
    };


    return (
        <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="flex items-center gap-2 mb-6">
                <Slider className="w-5 h-5 text-blue-500" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Fine-tune AI</h2>
            </div>
            <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Adjust the AI model parameters to customize its behavior.</p>

             {loading && (
                <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Loading settings...
                </div>
            )}

            {error && (
                <div className="flex items-center p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {error}
                </div>
            )}

           {!loading && !error && (
                <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Model Selection */}
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Model</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        >
                            {availableModels.map((modelOption) => (
                                <option key={modelOption} value={modelOption}>
                                    {modelOption}
                                </option>
                            ))}
                        </select>
                    </div>

                {/* Temperature */}
                <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        Temperature
                        <span className="ml-1 text-gray-500">({temperature.toFixed(1)})</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Top P */}
                <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        Top P
                        <span className="ml-1 text-gray-500">({topP.toFixed(1)})</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                 {/* Max Tokens */}
                <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        Max Tokens
                        <span className="ml-1 text-gray-500">({maxTokens})</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="2048"
                        step="1"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                        className="w-full"
                    />
                </div>

                {/* Frequency Penalty */}
                <div>
                     <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        Frequency Penalty
                        <span className="ml-1 text-gray-500">({frequencyPenalty.toFixed(1)})</span>
                    </label>
                    <input
                        type="range"
                        min="-2.0"
                        max="2.0"
                        step="0.1"
                        value={frequencyPenalty}
                        onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Presence Penalty */}
                 <div>
                   <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        Presence Penalty
                        <span className="ml-1 text-gray-500">({presencePenalty.toFixed(1)})</span>
                    </label>
                    <input
                        type="range"
                        min="-2.0"
                        max="2.0"
                        step="0.1"
                        value={presencePenalty}
                        onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>
              {/* Channel Selection Buttons */}
                <div className="mt-8">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        AI Assistant Prompt
                    </label>
                    <div className="flex space-x-4 mb-4">
                        {Object.keys(channelPrompts).map((channel) => (
                            <button
                                key={channel}
                                onClick={() => handleChannelChange(channel)}
                                className={`px-4 py-2 rounded-lg ${
                                    selectedChannel === channel
                                        ? `${theme === 'dark' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-900'} border border-indigo-500`
                                        : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border border-gray-300`
                                } transition-colors`}
                            >
                                {channel}
                            </button>
                        ))}
                    </div>

                    {/* Textarea for the selected channel */}
                    <textarea
                        value={channelPrompts[selectedChannel]}
                        onChange={handlePromptChange}
                        className={`w-full h-48 px-3 py-2 ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder={`Enter ${selectedChannel} prompt...`}
                    />
                </div>
            <div className="mt-8 flex justify-end">

                 {success && (
                    <div className="fixed top-20 right-8 flex items-center p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                    <Check className="mr-2 h-4 w-4" />
                        Settings saved!
                    </div>
                )}

                <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Save Settings
                </button>
            </div>
            </>
            )}
        </div>
    );
};

export default FineTuneView;
