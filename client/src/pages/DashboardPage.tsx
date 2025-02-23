// src/pages/DashboardPage.tsx
import React from 'react';
import { DashboardView } from '../components/DashboardView';
import { useApp } from '../contexts/AppContext';

const DashboardPage: React.FC = () => {
    const { theme } = useApp();
    return (
        <DashboardView theme={theme} />
    );
};

export default DashboardPage;
