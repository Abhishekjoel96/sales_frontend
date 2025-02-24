import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import * as messageService from '../../services/messageService';
import { Message } from '../../models/Message';
import { Lead } from '../../models/Lead';

interface EmailViewProps {
  theme: 'dark' | 'light';
  leads: Lead[];
}

export function EmailView({ theme, leads }: EmailViewProps) {
  const [selectedEmail, setSelectedEmail] = useState<Message | null>(null);
  const [emails, setEmails] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const { socket } = useApp(); // Access the socket from context

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      // Instead of passing an empty string for the lead id, we pass "all"
      // to fetch all emails (or adjust as per your service requirements)
      const fetchedEmails = await messageService.getMessagesByChannelAndLeadId("all", 'Email');
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
    // Set up the WebSocket listener for new email messages
    if (socket) {
      socket.on('message_received', (newMessage: Message) => {
        // Update the messages list only if the new message is an Email
        if (newMessage.channel === 'Email') {
          setEmails(prevEmails => [...prevEmails, newMessage]);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('message_received');
      }
    };
  }, [fetchEmails, socket]);

  const handleReply = async (content: string, leadId: string, channel: string) => {
    try {
      await messageService.sendMessage(leadId, channel, content);
      // Refetch emails to update the list after replying
      fetchEmails();
      setSelectedEmail(null);
    } catch (error: any) {
      console.error("Error sending reply:", error);
      setError(error.message || 'Failed to send reply');
    }
  };

  if (loading) {
    return <div>Loading emails...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex mt-16">
      {/* Quick Access Bar */}
      <div className="flex flex-col w-1/3 border-r border-gray-200 overflow-y-auto">
        <h2 className={`p-4 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Emails</h2>
        {emails.map(email => (
          <div
            key={email.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            onClick={() => setSelectedEmail(email)}
          >
            <p className="font-semibold">{email.subject}</p>
            <p className="text-sm">{email.snippet}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-1">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            <div className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
              <p className="text-sm">{selectedEmail.sender}</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p>{selectedEmail.content}</p>
            </div>
            <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              {/* Reply section */}
              <EmailReply
                email={selectedEmail}
                theme={theme}
                onReply={handleReply}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select an email to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface EmailReplyProps {
  email: Message;
  theme: 'dark' | 'light';
  onReply: (content: string, leadId: string, channel: string) => void;
}

function EmailReply({ email, theme, onReply }: EmailReplyProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  return (
    <div>
      {isReplying && (
        <div className="space-y-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className={`w-full p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
            placeholder="Type your reply here..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (replyContent.trim()) {
                  onReply(replyContent, email.lead_id, email.channel);
                  setReplyContent('');
                  setIsReplying(false);
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
      {!isReplying && (
        <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
          <button
            onClick={() => setIsReplying(true)}
            className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg hover:bg-opacity-80 transition-colors text-left`}
          >
            Click to reply...
          </button>
        </div>
      )}
    </div>
  );
}
