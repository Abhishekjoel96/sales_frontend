// src/pages/AnalyticsPage.tsx
import React from 'react';
import { AnalyticsView } from '../components/AnalyticsView';
import { useApp } from '../contexts/AppContext';

const AnalyticsPage: React.FC = () => {
   const { theme } = useApp(); // Assuming you have theme in your context

  return (
    <AnalyticsView theme={theme} />
  )
}

export default AnalyticsPage;