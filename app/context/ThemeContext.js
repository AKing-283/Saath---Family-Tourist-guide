import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#FFFFFF',
  cardBackground: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#4CAF50',
  error: '#FF3B30',
  border: '#E0E0E0',
};

export const darkTheme = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#66BB6A',
  error: '#FF453A',
  border: '#333333',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [colors, setColors] = useState(isDarkMode ? darkTheme : lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    setColors(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 