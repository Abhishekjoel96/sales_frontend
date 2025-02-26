// src/components/DashboardView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, PhoneCall, TrendingUp, Mail, Calendar, Clock, MessageSquare } from 'lucide-react';
import { AnimatedCard } from './shared/AnimatedCard';
import * as masterAgentService from '../services/masterAgentService'; // Corrected import
import { useApp } from '../contexts/AppContext';

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
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-gray-700/50 rounded-lg">
          {icon}
          </div>
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
   const { setLeads, setAppointments, setCallLogs, setMessages } = useApp();
    const [dashboardData, setDashboardData] = useState<any>(null); // Replace 'any' with a proper type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await masterAgentService.getDashboardData(); // Use the service function
      setDashboardData(data);
      setLeads(data.leadsData || []); // Update leads in context
      setAppointments(data.appointmentsData || []);
      setCallLogs(data.callLogsData || []);
      setMessages(data.messagesData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [setLeads, setAppointments, setCallLogs, setMessages]);

   useEffect(() => {
     fetchData();
    }, [fetchData]);


    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!dashboardData) {
      return <div>No Data...</div>; //Or some other placeholder
    }


    const kpis: KPI[] = [ // Using the interface
        { title: "Active Leads", value: dashboardData.activeLeads.count, change: "+0%", icon: <Users className="w-6 h-6 text-indigo-400" /> }, // Example change
        { title: "AI Calls Today", value: dashboardData.aiCallsToday.total, change: "+0%", icon: <PhoneCall className="w-6 h-6 text-green-400" /> },
        { title: "Auto Replies", value: dashboardData.autoReplies.total, change: "+0%", icon: <MessageSquare className="w-6 h-6 text-purple-400" /> },
        { title: "Conversion Rate", value: `${dashboardData.conversionRate}%`, change: "+0%", icon: <TrendingUp className="w-6 h-6 text-blue-400"/> }
    ];
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <>
      <header className="mb-8">
        <h2 className={`text-2xl font-bold ${textColor}`}>Lead Management</h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Monitor and manage your AI-powered lead interactions
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
          <StatCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} theme={theme} delay={0.1 * index} />
        ))}
      </div>

      {/* Recent Activities and Lead Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <AnimatedCard delay={0.5}>
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Recent Activities</h3>
                     {dashboardData.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                        {dashboardData.recentActivities.map((activity: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 10 }}
                            className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}
                        >
                            <div className="flex items-center gap-3">
                            {/*  Use dynamic icons based on activity.type */}
                            <motion.div
                                className={`w-2 h-2 rounded-full ${
                                activity.type === 'Lead Added' ? 'bg-green-400' :
                                activity.type === 'Lead Status Update' ? 'bg-blue-400' :
                                activity.type === 'Incoming Call' || activity.type === 'Outgoing Call' ? 'bg-yellow-400' :
                                'bg-gray-400'
                                }`}
                                whileHover={{ scale: 1.5 }}
                            />
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {activity.detail}
                            </p>
                            </div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1 ml-5`}>
                            {format(new Date(activity.timestamp), 'p')} {/* Correct date formatting */}

                            </p>
                        </motion.div>
                        ))}
                    </div>
                    ) : (
                    <p>No recent activities.</p> // Display a message if no activities
                    )}
                </div>
            </AnimatedCard>

        {/* Lead Pipeline */}
        <AnimatedCard delay={0.7}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border hover:border-indigo-500/50 transition-all duration-300`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Lead Pipeline</h3>
            <div className="space-y-4">
              {Object.entries(dashboardData.leadPipeline).map(([stage, leads], index) => {
                const count = (leads as any[]).length;
                let color = '';

                switch(stage){
                    case 'New':
                        color = 'blue';
                        break;
                    case 'Cold':
                        color = 'purple';
                        break;
                    case 'Warm':
                        color = 'yellow';
                        break;
                    case 'Hot':
                        color = 'red';
                        break;
                }

                return (
                    <motion.div
                        key={stage}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: -10 }}
                        className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}
                    >
                        <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${textColor}`}>{stage}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <motion.div
                                    className={`w-2 h-2 rounded-full bg-${color}-400`}
                                    whileHover={{ scale: 1.5 }}
                                />
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{count} leads</p>
                            </div>
                        </div>
                        </div>
                    </motion.div>
                );
                })}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </>
  );
}
