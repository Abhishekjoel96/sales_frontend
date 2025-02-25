// src/pages/AnalyticsPage.tsx

import React from 'react';
import { AnalyticsView } from '../components/AnalyticsView';
import { useApp } from '../contexts/AppContext';

const AnalyticsPage: React.FC = () => {
    const { theme } = useApp();
  return (
     <AnalyticsView theme={theme} />
  )
}

export default AnalyticsPage;
