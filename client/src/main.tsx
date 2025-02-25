// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { AppProvider } from './contexts/AppContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Make sure your index.html has a div with id='root'");
}

const root = createRoot(rootElement);

root.render(
        <AppProvider>
            <App />
        </AppProvider>
);
