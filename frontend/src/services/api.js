import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Function to get current user ID
export const getCurrentUserId = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      return parsedData.userId;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Function to refresh shared dashboards when user data changes
export const refreshSharedDashboards = async () => {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      await api.post('/dashboard/refresh-shared', { userId });
      console.log('Triggered shared dashboard refresh for user:', userId);
    }
  } catch (error) {
    console.error('Failed to refresh shared dashboards:', error);
  }
};

export default api;