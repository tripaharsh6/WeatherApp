import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { storage } from '../utils/storage';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateTheme } = useTheme();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getItem('accessToken');
      if (token) {
        // Fetch current profile
        const res = await apiClient.get('/profile/');
        if (res.data) {
          setUser({
            username: res.data.username,
            email: res.data.email,
            profile: {
              units: res.data.units,
              theme: res.data.theme,
              default_city: res.data.default_city,
            },
          });
          if (res.data.theme) {
            updateTheme(res.data.theme);
          }
        }
      }
    } catch (e) {
      console.log('Token check failed:', e?.message);
      await storage.removeItem('accessToken');
      await storage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await apiClient.post('/login/', { username, password });
    const { tokens, user: userData } = res.data;

    await storage.setItem('accessToken', tokens.access);
    await storage.setItem('refreshToken', tokens.refresh);

    setUser(userData);
    if (userData?.profile?.theme) {
      updateTheme(userData.profile.theme);
    }
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await apiClient.post('/register/', { username, email, password });
    const { tokens, user: userData } = res.data;

    await storage.setItem('accessToken', tokens.access);
    await storage.setItem('refreshToken', tokens.refresh);

    setUser(userData);
    if (userData?.profile?.theme) {
      updateTheme(userData.profile.theme);
    }
    return userData;
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await apiClient.put('/profile/', newPrefs);
      setUser(prev => ({
        ...prev,
        profile: {
          ...prev?.profile,
          units: res.data.units,
          theme: res.data.theme,
          default_city: res.data.default_city,
        },
      }));
      if (newPrefs.theme) {
        updateTheme(newPrefs.theme);
      }
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePreferences,
        refreshProfile: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
