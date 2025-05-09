import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isSystemTheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        const { isDark, isSystem } = JSON.parse(savedTheme);
        setIsDarkMode(isDark);
        setIsSystemTheme(isSystem);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      setIsSystemTheme(false);
      await AsyncStorage.setItem('theme', JSON.stringify({
        isDark: newIsDarkMode,
        isSystem: false,
      }));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setSystemTheme = async () => {
    try {
      setIsSystemTheme(true);
      setIsDarkMode(systemColorScheme === 'dark');
      await AsyncStorage.setItem('theme', JSON.stringify({
        isDark: systemColorScheme === 'dark',
        isSystem: true,
      }));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    setSystemTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightColors = {
  background: '#FFFFFF',
  text: '#1F2937',
  primary: '#10B981',
  secondary: '#059669',
  border: '#E5E7EB',
  card: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  placeholder: '#9CA3AF',
  disabled: '#D1D5DB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  header: '#10B981',
  headerText: '#FFFFFF',
  inputBackground: '#F3F4F6',
  inputText: '#1F2937',
  buttonText: '#FFFFFF',
  divider: '#E5E7EB',
};

const darkColors = {
  background: '#111827',
  text: '#F9FAFB',
  primary: '#34D399',
  secondary: '#10B981',
  border: '#374151',
  card: '#1F2937',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  placeholder: '#9CA3AF',
  disabled: '#4B5563',
  overlay: 'rgba(0, 0, 0, 0.7)',
  header: '#065F46',
  headerText: '#FFFFFF',
  inputBackground: '#1F2937',
  inputText: '#F9FAFB',
  buttonText: '#FFFFFF',
  divider: '#374151',
}; 