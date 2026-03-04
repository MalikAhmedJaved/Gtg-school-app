import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const auth = await AsyncStorage.getItem('isAuthenticated');
      const role = await AsyncStorage.getItem('userRole');
      const id = await AsyncStorage.getItem('userId');
      const data = await AsyncStorage.getItem('userData');

      if (auth === 'true' && token && role && id) {
        // Validate token by fetching the user profile from the API
        try {
          const response = await api.get('/users/profile');
          if (response.data.success && response.data.data) {
            const user = response.data.data;
            setIsAuthenticated(true);
            setUserRole(user.role);
            setUserId(String(user.id));
            setUserData(user);
            // Update stored data with fresh profile from server
            await AsyncStorage.setItem('userRole', user.role);
            await AsyncStorage.setItem('userId', String(user.id));
            await AsyncStorage.setItem('userData', JSON.stringify(user));
          } else {
            // Token invalid or profile fetch failed, clear auth state
            await clearAuthState();
          }
        } catch (apiError) {
          // If API is unreachable, use cached data so user isn't logged out offline
          console.warn('Could not validate token with server, using cached auth data');
          if (data) {
            setIsAuthenticated(true);
            setUserRole(role);
            setUserId(id);
            setUserData(JSON.parse(data));
          } else {
            await clearAuthState();
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthState = async () => {
    await AsyncStorage.multiRemove([
      'isAuthenticated',
      'userRole',
      'userId',
      'token',
      'userData',
    ]);
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserData(null);
  };

  const login = async (user, token) => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userId', String(user.id));
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setIsAuthenticated(true);
      setUserRole(user.role);
      setUserId(String(user.id));
      setUserData(user);
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  };

  const updateUserData = async (updatedUser) => {
    try {
      setUserData(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      if (updatedUser.role) {
        setUserRole(updatedUser.role);
        await AsyncStorage.setItem('userRole', updatedUser.role);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const logout = async () => {
    try {
      await clearAuthState();
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        userData,
        loading,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
