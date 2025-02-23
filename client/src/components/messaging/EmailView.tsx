// src/components/messaging/EmailView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Star, Trash2, Reply, Forward, X, Bot } from 'lucide-react';
import * as messageService from '../../services/messageService'; // Import message service
import { AppContext } from '../../contexts/AppContext';  // Assuming you'll use context
import { Message } from '../../models/Message'; // Import Message interface from backend models
import { Lead } from '../../models/Lead';


interface EmailViewProps {
    theme: 'dark' | 'light';
    leads: Lead[]; // Get leads from props, for displaying names
}


function EmailDetailView({ email, onReply, theme }: { email: Message | null; onReply: (content: string, leadId: string, channel:string) => void; theme: 'dark' | 'light' }) {
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    if (!email) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select an email to read
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Email Header */}
            <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {/* Assuming your backend provides a subject in the message content.  Adjust as needed. */}
                        {email.content.startsWith("Subject:") ? email.content.split("\n")[0].replace("Subject:", "").trim() : "No Subject"}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/*  Implement  starred logic */}
                        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Star className={`w-5 h-5 ${/*email.starred ? 'text-yellow-400' :*/ 'text-gray-400'}`} />
                        </button>
                        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Trash2 className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Reply className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Forward className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {/* Display sender/recipient based on message direction */}
                            {email.direction === "Inbound" ? "From: " + (email.content) : "To: (You)" }
                        </p>
                        <p className="text-sm text-gray-500">
                            {/* Display email if needed */}

                        </p>
                    </div>
                    <span className="text-sm text-gray-500">
                        {new Date(email.timestamp).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
                   {/* Display email content. Consider using a library like DOMPurify for security if rendering HTML. */}
                   {email.content}
                </div>
            </div>

            {/* Reply Section */}
            {isReplying && (
                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Type your reply..."
                            className={`w-full h-32 px-4 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 text-white placeholder-gray-400'
                                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                            } rounded-lg focus:outline-none resize-none`}
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsReplying(false)}
                                className={`px-4 py-2 ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                } text-gray-400 rounded-lg hover:bg-opacity-80 transition-colors`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (replyContent.trim()) {
                                        onReply(replyContent, email.lead_id, email.channel); // Pass leadId and channel
                                        setReplyContent('');
                                        setIsReplying(false);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click to Reply (Placeholder) */}
            {!isReplying && (
                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
                    <button
                        onClick={() => setIsReplying(true)}
                        className={`w-full px-4 py-2 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-100 text-gray-900'
                        } rounded-lg hover:bg-opacity-80 transition-colors text-left`}
                    >
                        Click to reply...
                    </button>
                </div>
            )}
        </div>
    );
}



export function EmailView({ theme, leads }: EmailViewProps) {
    const [selectedEmail, setSelectedEmail] = useState<Message | null>(null);
    const [emails, setEmails] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAIPopup, setShowAIPopup] = useState(false);

     const fetchEmails = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedEmails = await messageService.getMessagesByChannelAndLeadId('' , 'Email'); // Fetch only emails
            setEmails(fetchedEmails);
            setError(null); // Clear any previous errors
        } catch (err: any) {
            setError(err.message || 'Failed to fetch emails');
        } finally {
            setLoading(false);
        }
    }, []);


      useEffect(() => {
        fetchEmails();
          // Set up WebSocket connection
        const socket = io('http://localhost:3001'); // Replace with your backend URL

        socket.on('connect', () => {
          console.log('Connected to WebSocket');
        });

         socket.on('message_received', (newMessage: Message) => {
            // Update the messages list *only* if it's an email.
            if (newMessage.channel === 'Email') {
                setEmails(prevEmails => [...prevEmails, newMessage]);
            }
        });

        return () => {
          socket.disconnect();
        };
    }, [fetchEmails]);

    const handleReply = async (content: string, leadId: string, channel: string) => {
      try {
          await messageService.sendMessage(leadId, channel, content);
          // Fetch emails again to reflect the new message and update the list
          fetchEmails();
          // Optionally, clear the selected email or perform other UI updates
          setSelectedEmail(null);
      } catch (error: any) {
          console.error("Error sending reply:", error);
          setError(error.message || 'Failed to send reply');  // Update error state
      }
  };



    if (loading) {
        return <div>Loading emails...</div>; // Display loading message
    }

    if (error) {
        return <div>Error: {error}</div>; // Display error message
    }


    return (
        <div className="h-[calc(100vh-2rem)] flex mt-16">
            {/* Quick Access Bar */}
            <div className={`fixed top-0 right-0 left-64 h-16 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-b px-8 flex items-center justify-between z-10`}>
                {/* ... (rest of your Quick Access Bar code) */}
                <div className="flex items-center gap-4">

                <button
                    onClick={() => setShowAIPopup(true)}
                    className={`flex items-center gap-2 px-4 py-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    } rounded-lg hover:bg-opacity-80 transition-colors`}
                >
                    <Bot className="w-5 h-5 text-red-400" />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>AI Assistant</span>
                </button>
                </div>

            </div>

            {/* Email List */}
            <div className={`w-1/3 border-r ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-6 h-6 text-red-400" />
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email</h2>
                    </div>
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="Search emails..."
                        className={`w-full pl-10 pr-4 py-2 ${
                        theme === 'dark'
                        ? 'bg-gray-700 text-white placeholder-gray-400'
                        : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                        } rounded-lg focus:outline-none`}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Email List */}
            <div className="overflow-y-auto">
                {emails.map((email) => {
                  const lead = leads.find((lead) => lead.id === email.lead_id);
                  return (
                    <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`p-4 cursor-pointer ${
                            selectedEmail?.id === email.id
                                ? theme === 'dark'
                                    ? 'bg-gray-700'
                                    : 'bg-gray-100'
                                : theme === 'dark'
                                    ? 'hover:bg-gray-700/50'
                                    : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                        {/* Display lead's initial if available, otherwise a default icon */}
                        {lead ? lead.name[0] : <Users className="text-gray-400" />}
                        </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {/* Display subject or default */}
                                        {email.content.startsWith("Subject:") ? email.content.split("\n")[0].replace("Subject:", "").trim() : "No Subject"}
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {/* Display lead name or sender information */}
                                    {lead ? lead.name : "Unknown Sender"} {/* Show lead name if available */}
                                  </p>
                                    <span className="text-xs text-gray-500">
                                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {/* Limit preview length  */}
                                <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>

                                        {email.content.substring(0, 150)}

                                </p>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
            </div>

            {/* Email Content */}
            <div className="flex-1">
                <EmailDetailView
                    email={selectedEmail}
                    onReply={handleReply}
                    theme={theme}
                />
            </div>

            {/* AI Assistant Popup */}
            {showAIPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-red-400" />
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Ask about the data in the chat box
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAIPopup(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                    Ask AI Assistant
                                </label>
                                <textarea
                                    className={`w-full h-32 px-3 py-2 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    } border rounded-lg focus:outline-none focus:border-red-500`}
                                    placeholder="Ask about the data in the chat box..."
                                />
                            </div>
                            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Update AI Context
                            </button>
                        </div>
                    </div>
                </div>