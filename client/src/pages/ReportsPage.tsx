// src/pages/ReportsPage.tsx
import React from 'react';
import { CallReportView } from '../components/CallReportView';
import { useApp } from '../contexts/AppContext';


const ReportsPage = () => {
    const { theme } = useApp();
    return (
        <CallReportView theme={theme} />
    );
};

export default ReportsPage;