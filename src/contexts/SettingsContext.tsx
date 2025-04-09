import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlatformSettings } from '@/types';
import { getPlatformSettings } from '@/lib/data';

interface SettingsContextType {
  settings: PlatformSettings | null;
  loadingSettings: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Define default settings values (fallback if fetch fails or no settings exist)
const defaultSettings: PlatformSettings = {
  platform_name: "Websauce Community",
  admin_email: "admin@websauce.com",
  timezone: "UTC",
  date_format: "MM/DD/YYYY",
  email_from: "no-reply@websauce.com",
  email_sender_name: "Websauce Community",
  welcome_subject: "Welcome to Websauce Community!",
  welcome_template: `Hello {{name}},\n\nWelcome!`, // Simplified default
  primary_color: "#3B82F6",   // Default blue
  secondary_color: "#10B981", // Default green
  logo_url: "https://websauce.be/wp-content/themes/websauce/dist/images/logo.svg", // Default logo
  favicon_url: ""
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: fetchedSettings, isLoading, isError } = useQuery<PlatformSettings | null>({
    queryKey: ['platformSettings'], // Same key as in AdminSettings
    queryFn: getPlatformSettings,
    staleTime: 1000 * 60 * 5, // Cache settings for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch just on window focus
  });

  // Use fetched settings if available, otherwise use defaults
  const settings = fetchedSettings || defaultSettings;

  // Effect to set CSS variables for colors
  useEffect(() => {
    if (settings) {
      console.log("Applying settings to CSS variables:", settings);
      document.documentElement.style.setProperty('--color-theme-primary', settings.primary_color);
      document.documentElement.style.setProperty('--color-theme-secondary', settings.secondary_color);
      // Add more variables if needed (e.g., for text colors based on background)
    }
  }, [settings]); // Re-run if settings object changes

  // Display loading or error state if needed, or just provide potentially default settings
  const value = {
    settings: settings, // Always provide settings (fetched or default)
    loadingSettings: isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 