// src/components/DashboardView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, PhoneCall, MessageSquare, TrendingUp, Mail, Calendar, Clock } from 'lucide-react';
import { AnimatedCard } from './shared/AnimatedCard';
import { motion } from 'framer-motion';
import * as leadService from '../services/leadService'; // Import lead service
import * as messageService from '../services/messageService'; // Import message service
import * as callService from '../services/callService'; // Import call service

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  theme: 'dark' | 'light';
  delay?: number;
}

function StatCard({ title, value, change, icon, theme, delay = 0 }: StatCardProps) {
  const isPositive = change.startsWith('+');
  return (
    <AnimatedCard delay={delay}>
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border group hover:border-indigo-500/50 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="p-2 bg-gray-700/50 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {icon}
          </motion.div>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            {change}
          </span>
        </div>
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</h3>
        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1 group-hover:text-indigo-400 transition-colors`}>{value}</p>
      </div>
    </AnimatedCard>
  );
}

export function DashboardView({ theme }: { theme: 'dark' | 'light' }) {

    const [totalLeads, setTotalLeads] = useState<number>(0);
    const [hotLeads, setHotLeads] = useState<number>(0);
    const [warmLeads, setWarmLeads] = useState<number>(0);
    const [coldLeads, setColdLeads] = useState<number>(0);
    const [totalCalls, setTotalCalls] = useState<number>(0);
    const [incomingCalls, setIncomingCalls] = useState<number>(0);
    const [outgoingCalls, setOutgoingCalls] = useState<number>(0);
    const [totalAutoReplies, setTotalAutoReplies] = useState<number>(0);
    const [whatsappReplies, setWhatsappReplies] = useState<number>(0);
    const [smsReplies, setSmsReplies] = useState<number>(0);
    const [emailReplies, setEmailReplies] = useState<number>(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const leads = await leadService.getAllLeads();
            const callLogs = await callService.getAllCallLogs();
            const messages = await messageService.getAllMessages();

             // Calculate lead metrics
            setTotalLeads(leads.length);
            setHotLeads(leads.filter(lead => lead.status === 'Hot').length);
            setWarmLeads(leads.filter(lead => lead.status === 'Warm').length);
            setColdLeads(leads.filter(lead => lead.status === 'Cold').length);

            // Calculate call metrics
            const today = new Date().toISOString().split('T')[0];
            let todayTotalCalls = 0;
            let todayIncomingCalls = 0;
            let todayOutgoingCalls = 0;

            callLogs.forEach(callLog => {
                if (callLog.timestamp.startsWith(today)) {
                    todayTotalCalls++;
                    if (callLog.direction === 'Inbound') {
                        todayIncomingCalls++;
                    } else {
                        todayOutgoingCalls++;
                    }
                }
            });
             setTotalCalls(todayTotalCalls)
             setIncomingCalls(todayIncomingCalls);
             setOutgoingCalls(todayOutgoingCalls);


            // Calculate auto-reply metrics
            let totalReplies = 0;
            let whatsappCount = 0;
            let smsCount = 0;
            let emailCount = 0;

            messages.forEach(message => {
            if (message.direction === 'Outbound') {
                totalReplies++;
                if (message.channel === 'WhatsApp') {
                whatsappCount++;
                } else if (message.channel === 'SMS') {
                smsCount++;
                } else if (message.channel === 'Email') {
                emailCount++;
                }
            }
            });

            setTotalAutoReplies(totalReplies);
            setWhatsappReplies(whatsappCount);
            setSmsReplies(smsCount);
            setEmailReplies(emailCount);
            setError(null); // Clear any previous errors
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);  // Empty dependency array means this effect runs once on mount

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
    return <div>Loading...</div>;
    }

    if (error) {
    return <div>Error: {error}</div>;
    }
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="mb-8">
        <motion.h2
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className={`text-2xl font-bold ${textColor}`}
        >
          Lead Management
        </motion.h2>
        <motion.p
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.1 }}
          className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        >
          Monitor and manage your AI-powered lead interactions
        </motion.p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Leads"
          value={totalLeads}
          change="+12.3%"
          icon={<Users className="w-6 h-6 text-indigo-400" />}
          theme={theme}
          delay={0.1}
        />
        <StatCard
          title="AI Calls Today"
          value={totalCalls}
          change="+8.1%"  // Example change - calculate this dynamically in a real app
          icon={<PhoneCall className="w-6 h-6 text-green-400" />}
          theme={theme}
          delay={0.2}
        />
        <StatCard
          title="Auto Replies"
          value={totalAutoReplies}
          change="+15.4%" // Example change
          icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
          theme={theme}
          delay={0.3}
        />
        <StatCard
          title="Conversion Rate"
          value={"25%"}
          change="+5.2%"  // Example change
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
          theme={theme}
          delay={0.4}
        />
      </div>

      {/* Recent Activities and Lead Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <AnimatedCard delay={0.5}>
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border hover:border-indigo-500/50 transition-all duration-300`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Recent Activities</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (  // Replace with actual activity data
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-blue-400' : 'bg-purple-400'}`}
                      whileHover={{ scale: 1.5 }}
                    />
                    <p className={`text-sm ${textColor}`}>
                      {index === 0 ? 'New lead captured from website' :
                       index === 1 ? 'AI completed follow-up call' :
                       'Auto-reply sent to inquiry'}
                    </p>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400':'text-gray-600'} mt-1 ml-5`}>
                    {index === 0 ? '2 minutes ago' :
                     index === 1 ? '15 minutes ago' :
                     '1 hour ago'}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Lead Pipeline */}
        <AnimatedCard delay={0.7}>
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border hover:border-indigo-500/50 transition-all duration-300`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Lead Pipeline</h3>
            <div className="space-y-4">
              {[
                { stage: 'New Leads', count: 0, color: 'blue' },   // Replace with dynamic data
                { stage: 'Hot Leads', count: 0, color: 'red' },
                { stage: 'Warm Leads', count: 0, color: 'yellow' },
                { stage: 'Cold Leads', count: 0, color: 'purple' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: -10 }}
                  className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${textColor}`}>{item.stage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <motion.div
                          className={`w-2 h-2 rounded-full bg-${item.color}-400`}
                          whileHover={{ scale: 1.5 }}
                        />
                        <p className="text-sm text-gray-600">{item.count} leads</p>
                      </div>
                    </div>
                    <div className={`text-${item.color}-400 text-sm font-medium`}>
                      {/*  Dynamic change indicator */}
                      +0 today
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </motion.div>
  );
}