import { create } from 'zustand';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: Cookies.get('accessToken') || null,
  isLoading: false,
  error: null,
  notifications: [],

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
  },

  fetchNotifications: async () => {
    const token = Cookies.get('accessToken');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: token }
      });
      set({ notifications: response.data.data });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },

  markNotificationAsRead: async (id) => {
    const token = Cookies.get('accessToken');
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: token }
      });
      set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllNotificationsAsRead: async () => {
    const token = Cookies.get('accessToken');
    const { notifications } = get();
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    try {
      // Optimistically update
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
      }));

      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: token }
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Re-fetch to sync if failed
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: token }
      });
      set({ notifications: response.data.data });
    }
  },
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50)
    }));
  }
}));

export default useAuthStore;
