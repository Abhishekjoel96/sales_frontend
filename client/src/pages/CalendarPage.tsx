// src/pages/CalendarPage.tsx
import React from 'react';
import { Calendar } from '../components/Calendar';
import { useApp } from '../contexts/AppContext';

const CalendarPage: React.FC = () => {
  const { theme, leads } = useApp(); // Get leads and theme from context.
  return <Calendar theme={theme} leads={leads} />;
};

export default CalendarPage;
