// src/pages/DashboardPage.tsx
import React from 'react';
import { DashboardView } from '../components/DashboardView';
import { useApp } from '../contexts/AppContext';

const DashboardPage: React.FC = () => {
    const { theme } = useApp(); // Assuming you have theme in your context
    return <DashboardView theme={theme} />; // Pass theme and leads
};

export default DashboardPage;