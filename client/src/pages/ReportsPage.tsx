// src/pages/ReportsPage.tsx
import React from 'react';
import { CallReportView } from '../components/CallReportView';
import { useApp } from '../contexts/AppContext';

const ReportsPage = () => {
    const { theme, leads, callLogs } = useApp(); // Get leads and callLogs from context
    return (
        <CallReportView theme={theme} callLogs={callLogs} leads={leads}/>

    );
};

export default ReportsPage;
