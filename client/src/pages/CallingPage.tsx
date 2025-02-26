// src/pages/CallingPage.tsx
import React from 'react';
import { AICallingView } from '../components/AICallingView';
import { useApp } from '../contexts/AppContext';

const CallingPage: React.FC = () => {
    const { theme, leads } = useApp(); // Get leads from context for scheduling
    return <AICallingView theme={theme} leads={leads}/>;
};

export default CallingPage;
