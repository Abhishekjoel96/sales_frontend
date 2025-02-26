// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import CallingPage from './pages/CallingPage';
import CalendarPage from './pages/CalendarPage';
import MessagingPage from './pages/MessagingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import { useApp } from './contexts/AppContext';
import { Toaster } from 'react-hot-toast';


function App() {
  const { theme } = useApp();
  return (
    <Router>
      <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-grow p-6 overflow-y-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/calling" element={<CallingPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              {/* Catch-all route for 404s, etc. */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </div>
    </Router>
  );
}
function AppWithContext() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}
export default AppWithContext;
