import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.4:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data && response.data.data) {
        await AsyncStorage.setItem('accessToken', response.data.data.access_token);
        await AsyncStorage.setItem('refreshToken', response.data.data.refresh_token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/account');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 