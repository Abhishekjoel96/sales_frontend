// src/components/DashboardView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, PhoneCall, TrendingUp, Mail, Calendar, Clock, MessageSquare } from 'lucide-react'; // Corrected import
import { AnimatedCard } from './shared/AnimatedCard';
import { useApp } from '../contexts/AppContext';

interface DashboardViewProps {
  theme: 'dark' | 'light';
}
interface KPI {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
}

export function DashboardView({ theme }: DashboardViewProps) {
  const {  getLeadMetrics, getCallMetrics } = useApp();
  const [leadMetrics, setLeadMetrics] = useState({total: 0, hot: 0, warm: 0, cold: 0});
  const [callMetrics, setCallMetrics] = useState({total: 0, incoming: 0, outgoing: 0})
  const [autoReplies, setAutoReplies] = useState({total: 0, whatsapp: 0, sms: 0, email: 0});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try{
        setLoading(true)
        // const dashboardData = await masterAgentService.getDashboardData();
        // setLeadMetrics(dashboardData.activeLeads);
        // setCallMetrics(dashboardData.aiCallsToday);
        // setAutoReplies(dashboardData.autoReplies)
        const leadData = getLeadMetrics();
        const callData = getCallMetrics();
        setLeadMetrics(leadData);
        setCallMetrics(callData)

    } catch(error: any){
        setError(error.message || "Failed to fetch dashboard data");
    } finally{
        setLoading(false)
    }
  }, [getLeadMetrics, getCallMetrics])

    useEffect(() => {
      fetchData();
       // Set up WebSocket connection -- No need for the connection establishment.
    }, [fetchData]);


  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const kpis: KPI[] = [
    { title: "Active Leads", value: leadMetrics.total, change: "+12.3%", icon: <Users className="w-6 h-6 text-indigo-400" /> },
    { title: "AI Calls Today", value: callMetrics.total, change: "+8.1%", icon: <PhoneCall className="w-6 h-6 text-green-400" /> },
    { title: "Auto Replies", value: autoReplies.total, change: "+15.4%", icon: <MessageSquare className="w-6 h-6 text-purple-400" />},
    { title: "Conversion Rate", value: `23.5%`, change: "+5.2%", icon: <TrendingUp className="w-6 h-6 text-blue-400" /> },
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
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border hover:border-indigo-500/50 transition-all duration-300`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Recent Activities</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => ( // Replace with actual activity data
                <div
                  key={index}
                  className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-blue-400' : 'bg-purple-400'}`}
                    />
                    <p className={`text-sm ${textColor}`}>
                      {index === 0 ? 'New lead captured from website' :
                       index === 1 ? 'AI completed follow-up call' :
                       'Auto-reply sent to inquiry'}
                    </p>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1 ml-5`}>
                    {index === 0 ? '2 minutes ago' :
                     index === 1 ? '15 minutes ago' :
                     '1 hour ago'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Lead Pipeline */}
        <AnimatedCard delay={0.7}>
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border hover:border-indigo-500/50 transition-all duration-300`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Lead Pipeline</h3>
            <div className="space-y-4">
              {[  //Replace with original data.
                { stage: 'New Leads', count: 0, color: 'blue' },
                { stage: 'Hot Leads', count: 0, color: 'red' },
                { stage: 'Warm Leads', count: 0, color: 'yellow' },
                { stage: 'Cold Leads', count: 0, color: 'purple' }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg cursor-pointer`}                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${textColor}`}>{item.stage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full bg-${item.color}-400`}
                        />
                        <p className="text-sm text-gray-600">{item.count} leads</p>
                      </div>
                    </div>
                    <div className={`text-${item.color}-400 text-sm font-medium`}>
                      {/*  Dynamic change indicator */}
                      +0 today
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </>
  );
}
