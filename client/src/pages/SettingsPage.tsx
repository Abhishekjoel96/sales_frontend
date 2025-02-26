// src/pages/SettingsPage.tsx
import React from 'react';
import { FineTuneView } from '../components/FineTuneView';
import { useApp } from '../contexts/AppContext';

const SettingsPage: React.FC = () => {
     const { theme } = useApp(); // Access theme from context
  return (
     <FineTuneView theme={theme}/>
  )
}

export default SettingsPage;
