// src/pages/ReportsPage.tsx
import React from 'react';
//Corrected path
import { CallReportView } from '../components/CallReportView'; // Make sure this path is correct
import { useApp } from '../contexts/AppContext';


const ReportsPage = () => {
    const { theme, leads, callLogs } = useApp(); // Get required data from context
    return (
        <CallReportView theme={theme} callLogs={callLogs} leads={leads} />

    );
};

export default ReportsPage;
