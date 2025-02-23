// src/components/AnalyticsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Users, PhoneCall, TrendingUp, Mail, Calendar } from 'lucide-react';
import * as analyticsService from '../services/analyticsService'; // You'll need to create this
import { AnimatedCard } from './shared/AnimatedCard';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface KPI {
    title: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
}

interface AnalyticsData {
    totalLeads: number;
    appointmentsBooked: number;
    conversionRate: number;
    avgCallDuration: string;
    totalCalls: number;
    leadVolume: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number; }[] };
    channelDistribution: { labels: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }[] };
    conversionRateTrends: { labels: string[]; datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; tension: number; fill: boolean; }[] };
    leadFunnel: { labels: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }[] };
}

const initialData: AnalyticsData = { // Initialize with empty data
    totalLeads: 0,
    appointmentsBooked: 0,
    conversionRate: 0,
    avgCallDuration: '0m 0s',
    totalCalls: 0,
    leadVolume: { labels: [], datasets: [{ label: 'Lead Volume', data: [], backgroundColor: 'rgba(99, 102, 241, 0.5)', borderColor: 'rgb(99, 102, 241)', borderWidth: 1 }] },
    channelDistribution: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }] },
    conversionRateTrends: { labels: [], datasets: [{ label: 'Conversion Rate', data: [], borderColor: 'rgb(99, 102, 241)', backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4, fill: true }] },
    leadFunnel: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }] },
};

const timeRangeOptions = ['Day', 'Week', 'Month'] as const;
type TimeRange = typeof timeRangeOptions[number];

export function AnalyticsView({ theme }: { theme: 'dark' | 'light' }) {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('Week');
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string } | null>(null);


     const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch analytics data, passing date range if selected
            const data = await analyticsService.getAnalytics(selectedDateRange?.start, selectedDateRange?.end);
            setAnalyticsData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    }, [selectedDateRange]);

    useEffect(() => {
        fetchData();
        // Consider adding WebSocket listener here for real-time updates
        // e.g., socket.on('analytics_updated', fetchData);
    }, [fetchData]);

      const handleDateRangeChange = (start: string, end: string) => {
        setSelectedDateRange({ start, end });
    };
    // Function to trigger data export, implemented later
    const handleExportData = () => {
      //Implement later
    }


    if (loading) {
        return <div>Loading analytics...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    const kpis: KPI[] = [
        { title: "Total Leads", value: analyticsData.totalLeads, change: "+0%", icon: <Users className="w-6 h-6 text-indigo-400" /> },
        { title: "Appointments Booked", value: analyticsData.appointmentsBooked, change: "+0%", icon: <Calendar className="w-6 h-6 text-indigo-400" /> },
        { title: "Conversion Rate", value: `${analyticsData.conversionRate}%`, change: "+0%", icon: <TrendingUp className="w-6 h-6 text-indigo-400" /> },
        { title: "Avg Call Duration", value: analyticsData.avgCallDuration, change: "+0%", icon: <Clock className="w-6 h-6 text-indigo-400" /> },
        { title: "Total Calls", value: analyticsData.totalCalls, change: "+0%", icon: <PhoneCall className="w-6 h-6 text-indigo-400" /> }
    ];

   const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';


    return (
        <>
            <header className="mb-8">
                <h2 className={`text-2xl font-bold ${textColor}`}>Analytics Dashboard</h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Track and analyze your lead generation performance</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {kpis.map((kpi, index) => (
                  <AnimatedCard key={kpi.title} delay={0.1 * index}>
                    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                      <div className="flex items-center justify-between mb-2">
                        {kpi.icon}
                         <span className="text-green-400 text-sm">{kpi.change}</span>
                      </div>
                        <h3 className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{kpi.title}</h3>
                        <p className={`text-2xl font-bold ${textColor} mt-1`}>{kpi.value}</p>
                    </div>
                  </AnimatedCard>
                ))}
            </div>

            {/* Charts Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lead Volume Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-semibold ${textColor}`}>Lead Volume</h3>
                     {/* Date Range Picker */}
                    </div>
                    <Bar
                        data={analyticsData.leadVolume}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                             scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                     ticks: {
                                        color: theme === 'dark' ? '#9CA3AF' : '#6B7280', // Adjust text color based on theme
                                     }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    },
                                     ticks: {
                                        color: theme === 'dark' ? '#9CA3AF' : '#6B7280', // Adjust text color based on theme
                                     }
                                }
                            }
                        }}
                    />
                </div>

                {/* Channel Distribution Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                    <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Channel Distribution</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <Pie
                            data={analyticsData.channelDistribution}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                 {/* Conversion Rate Trends Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                    <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Conversion Rate Trends</h3>
                    <Line
                        data={analyticsData.conversionRateTrends}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                                 y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                     ticks: {
                                        color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                                        callback: (value) => `${value}%`
                                     }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    },
                                    ticks: {
                                        color: theme === 'dark' ? '#9CA3AF' : '#6B7280', // Adjust text color
                                    }
                                }
                            }
                        }}
                    />
                </div>

                {/* Lead Funnel Chart */}
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
                    <h3 className={`text-lg font-semibold ${textColor} mb-6`}>Lead Funnel</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <Bar
                            data={analyticsData.leadFunnel}
                            options={{
                                indexAxis: 'y',
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: {
                                       beginAtZero: true,
                                        grid: {
                                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                        },
                                        ticks: {
                                          color: theme === 'dark' ? '#9CA3AF' : '#6B7280'
                                        }
                                    },
                                    y: {

                                        grid: {
                                            display: false
                                        },
                                        ticks: {
                                            color: theme === 'dark' ? '#9CA3AF' : '#6B7280', // Adjust text color
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}