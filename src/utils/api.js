import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
// API URL is set via EXPO_PUBLIC_API_URL in the .env file at the project root.
// To switch environments, edit .env and restart the dev server.
// The Glory to God PPEC backend does not yet exist — set EXPO_PUBLIC_API_URL
// once it's deployed. The localhost fallback is for dev only.
const getApiBaseURL = () => {
  const FALLBACK_URL = 'http://localhost:3000/api';
  return process.env.EXPO_PUBLIC_API_URL || FALLBACK_URL;
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.multiRemove([
          'token',
          'isAuthenticated',
          'userRole',
          'userId',
          'userData',
        ]);
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
