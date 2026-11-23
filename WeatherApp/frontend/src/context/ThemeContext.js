import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await storage.getItem('userTheme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeMode(savedTheme);
      } else if (systemScheme === 'dark') {
        setThemeMode('dark');
      }
    };
    loadSavedTheme();
  }, [systemScheme]);

  const updateTheme = async (mode) => {
    setThemeMode(mode);
    await storage.setItem('userTheme', mode);
  };

  const toggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    updateTheme(nextMode);
  };

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, colors, isDark: themeMode === 'dark', updateTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
