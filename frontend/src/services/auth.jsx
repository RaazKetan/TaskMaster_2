// MongoDB-only authentication service
import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/register', userData);
    return response.data;
  },

  async logout() {
    const response = await api.post('/logout');
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionToken');
    return response.data;
  },

  async getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  async updateProfile(userData) {
    const response = await api.put('/user/profile', userData);
    return response.data;
  }
};
