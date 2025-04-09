import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SettingsProvider } from './contexts/SettingsContext'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create the QueryClient instance here
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
