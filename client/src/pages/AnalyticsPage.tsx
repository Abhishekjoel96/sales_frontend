// src/pages/AnalyticsPage.tsx

import React from 'react';
import { AnalyticsView } from '../components/AnalyticsView';
import { useApp } from '../contexts/AppContext';


const AnalyticsPage: React.FC = () => {
    const { theme } = useApp(); // Get theme from context

    return (
        <AnalyticsView theme={theme} />
    );
}

export default AnalyticsPage;
