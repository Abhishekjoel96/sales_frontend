// src/pages/ReportsPage.tsx

import React from 'react';
import { CallReportView } from '../components/CallReportView'; // Make sure this path is correct
import { useApp } from '../contexts/AppContext';


const ReportsPage = () => {
    const { theme } = useApp();
    return (
        <CallReportView theme={theme} />

    );
};

export default ReportsPage;
