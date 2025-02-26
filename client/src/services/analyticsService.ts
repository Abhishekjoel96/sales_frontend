// src/services/analyticsService.ts
import api from '../config/api';

export const getAnalytics = async (startDate?: string, endDate?: string): Promise<any> => {
    const params = { start_date: startDate, end_date: endDate };
    const response = await api.get('/analytics', { params });
    return response.data;
};
