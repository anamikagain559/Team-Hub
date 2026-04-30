import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  goals: [],
  isLoading: false,

  fetchWorkspaces: async () => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/workspaces`, {
        headers: { Authorization: accessToken }
      });
      set({ workspaces: response.data.data, isLoading: false });
      if (response.data.data.length > 0 && !get().currentWorkspace) {
        set({ currentWorkspace: response.data.data[0] });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  createWorkspace: async (workspaceData) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/workspaces`, workspaceData, {
        headers: { Authorization: accessToken }
      });
      set((state) => ({ 
        workspaces: [...state.workspaces, response.data.data],
        isLoading: false 
      }));
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchGoals: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/goals/${workspaceId}`, {
        headers: { Authorization: accessToken }
      });
      set({ goals: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Optimistic UI for updating goal status
  updateGoalStatus: async (goalId, status) => {
    const { accessToken } = useAuthStore.getState();
    const previousGoals = get().goals;

    // Optimistically update
    set({
      goals: previousGoals.map((g) =>
        g.id === goalId ? { ...g, status } : g
      ),
    });

    try {
      await axios.patch(`${API_URL}/goals/${goalId}/status`, { status }, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      // Rollback on error
      set({ goals: previousGoals });
      throw error;
    }
  },
}));

export default useWorkspaceStore;
