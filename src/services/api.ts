import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - Change this to your backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            try {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
            } catch (err) {
                console.error('Error clearing storage:', err);
            }
        }
        return Promise.reject(error);
    }
);

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export default api;
