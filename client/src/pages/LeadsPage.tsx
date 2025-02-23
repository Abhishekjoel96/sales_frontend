// src/pages/LeadsPage.tsx
import React from 'react';
import { LeadsView } from '../components/LeadsView';
import { useApp } from '../contexts/AppContext';

const LeadsPage: React.FC = () => {
    const {theme, leads } = useApp()
    return <LeadsView theme={theme} leads={leads} />;
};

export default LeadsPage;