// src/pages/LeadsPage.tsx
import React from 'react';
import { LeadsView } from '../components/LeadsView';
import { useApp } from '../contexts/AppContext';

const LeadsPage: React.FC = () => {
    const { theme, leads, setLeads } = useApp(); // Get leads and setLeads from context
    return <LeadsView theme={theme} leads={leads} setLeads={setLeads} />; // Pass leads and setLeads
};

export default LeadsPage;
