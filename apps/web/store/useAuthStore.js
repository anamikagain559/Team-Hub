import { create } from 'zustand';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: Cookies.get('accessToken') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { accessToken } = response.data.data;
      
      Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
      set({ accessToken, isLoading: false });
      
      // Fetch user profile if needed or decode token
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (e) {}
    Cookies.remove('accessToken');
    set({ user: null, accessToken: null });
  },

  setAccessToken: (token) => {
    Cookies.set('accessToken', token);
    set({ accessToken: token });
  },

  fetchMe: async () => {
    const token = Cookies.get('accessToken');
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: token }
      });
      set({ user: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch user', isLoading: false });
    }
  },

  updateProfile: async (data, file) => {
    const token = Cookies.get('accessToken');
    set({ isLoading: true, error: null });
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('data', JSON.stringify(data));

      const response = await axios.patch(`${API_URL}/users/update-profile`, formData, {
        headers: { 
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set({ user: response.data.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Update failed', isLoading: false });
      throw error;
    }
  }
}));

export default useAuthStore;
