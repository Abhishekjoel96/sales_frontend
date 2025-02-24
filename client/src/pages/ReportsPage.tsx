// src/pages/ReportsPage.tsx
import React from 'react';
import { CallReportView } from '../components/CallReportView'; // Make sure this path is correct
import { useApp } from '../contexts/AppContext';
import { AICallingView } from '../components/AICallingView';


const ReportsPage = () => {
    const { theme, leads } = useApp();
    return (
        // <CallReportView theme={theme} />
        <AICallingView theme={theme} leads={leads}/> // Assuming you'll display call reports within AICallingView
    );
};

export default ReportsPage;
