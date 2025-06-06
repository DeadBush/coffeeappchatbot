import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
const api = axios.create({
    // Replace with your Spring Boot backend URL
    baseURL: 'http://162.148.1.4:8080', // For Android emulator
    // baseURL: 'http://localhost:8080', // For iOS simulator
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            await AsyncStorage.removeItem('auth_token');
            // You might want to redirect to login screen here
        }
        return Promise.reject(error);
    }
);

export default api; 