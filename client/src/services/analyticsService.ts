// src/services/analyticsService.ts
import api from '../config/api';

// Define a type for the analytics data.  This should match the structure
// returned by your backend (MasterAgentService).
interface AnalyticsData {
    totalLeads: number;
    appointmentsBooked: number;
    conversionRate: number;
    avgCallDuration: string; // Or number, if you store it as seconds/ms
    totalCalls: number;
    leadVolume: any; // Replace 'any' with the actual chart data type
    channelDistribution: any; // Replace 'any' with the actual chart data type
    conversionRateTrends: any; // Replace 'any' with the actual chart data type
    leadFunnel: any;          // Replace 'any' with the actual chart data type
    // Add other metrics as needed
    [key: string]: any; // Add index signature
}

export const getAnalytics = async (startDate?: string, endDate?: string): Promise<AnalyticsData> => {
    try {
        let url = '/ai/dashboard'; // Assuming your backend endpoint is /api/ai/dashboard
        const params = new URLSearchParams();

        if (startDate) {
            params.append('startDate', startDate);
        }
        if (endDate) {
            params.append('endDate', endDate);
        }
        // Append the params to the URL
        if(startDate || endDate) {
            url += `?${params.toString()}`;
        }

        const response = await api.get<AnalyticsData>(url);
        return response.data; // Axios automatically parses the JSON

    } catch (error: any) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
};

// Add other analytics-related functions here, if needed (e.g., getSpecificReport)