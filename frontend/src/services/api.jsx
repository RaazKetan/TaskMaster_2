import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/public';

console.log('MongoDB API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session token
api.interceptors.request.use(
  (config) => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      config.headers['Session-Token'] = sessionToken;
      console.log('Adding session token to request:', sessionToken);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication failed - clearing localStorage');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle MongoDB auth errors
api.interceptors.response.use(
  (response) => {
    console.log('MongoDB Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('MongoDB Response error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
