import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
    Users,
    PhoneCall,
    MessageCircle,
    Mail,
    Calendar,
    Sparkles,
    BarChart3,
    Settings,
    UserPlus,
    FileText
} from 'lucide-react';
import { AppProvider } from './contexts/AppContext';
import { PageTransition } from './components/shared/PageTransition';

// Lazy-load components to improve initial load time
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const LeadsPage = React.lazy(() => import('./pages/LeadsPage'));
const CallingPage = React.lazy(() => import('./pages/CallingPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage')); // Assuming a settings page
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));


const routes = [
    { path: "/", component: DashboardPage, name: "Dashboard", icon: <Users /> },
    { path: "/leads", component: LeadsPage, name: "Leads", icon: <UserPlus /> },
    { path: "/calling", component: CallingPage, name: "AI Calling", icon: <PhoneCall /> },
    { path: "/calendar", component: CalendarPage, name: "Calendar", icon: <Calendar /> },
    { path: "/messaging", component: MessagingPage, name: "Messaging", icon: <MessageCircle /> },
    { path: "/analytics", component: AnalyticsPage, name: "Analytics", icon: <BarChart3 /> },
    {path: "/reports", component: ReportsPage, name: "Reports", icon: <FileText />},
    { path: "/settings", component: SettingsPage, name: "Settings", icon: <Settings /> }, // Assuming a settings page
];


function App() {
    const [isDarkMode, setIsDarkMode] = useState(true); // Initialize with dark mode

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

      useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

    return (
        <AppProvider>
            <Router>
                <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 p-4">
                        <div className="flex items-center gap-2 mb-8">
                            {/* Replace with your logo */}
                            <span className="text-xl font-bold text-white">BusinessOn.ai</span>
                        </div>
                        <nav className="space-y-1">
                            {routes.map((route) => (
                                <NavLink
                                    key={route.path}
                                    to={route.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-indigo-500 text-white'
                                                : isDarkMode
                                                ? 'text-gray-400 hover:bg-gray-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }

                                >
                                    {route.icon}
                                    <span className="font-medium">{route.name}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <button onClick={toggleTheme}>Toggle Theme</button>
                    </aside>

                    <main className="ml-64 p-8">
                      <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            {routes.map((route) => (
                                <Route key={route.path} path={route.path} element={<PageTransition key={route.path}><route.component /></PageTransition>} />
                            ))}
                        </Routes>
                      </Suspense>
                    </main>
                </div>
            </Router>
        </AppProvider>
    );
}

export default App;
