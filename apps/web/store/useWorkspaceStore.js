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

  createGoal: async (goalData) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/goals`, goalData, {
        headers: { Authorization: accessToken }
      });
      const newGoal = response.data.data;
      set((state) => ({ 
        goals: [newGoal, ...state.goals],
        isLoading: false 
      }));
      return newGoal;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateGoal: async (goalId, goalData) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.patch(`${API_URL}/goals/${goalId}`, goalData, {
        headers: { Authorization: accessToken }
      });
      const updatedGoal = response.data.data;
      set((state) => ({
        goals: state.goals.map((g) => g.id === goalId ? { ...g, ...updatedGoal } : g)
      }));
      return updatedGoal;
    } catch (error) {
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.delete(`${API_URL}/goals/${goalId}`, {
        headers: { Authorization: accessToken }
      });
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId)
      }));
    } catch (error) {
      throw error;
    }
  },

  addMilestone: async (goalId, milestoneData) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.post(`${API_URL}/goals/${goalId}/milestones`, milestoneData, {
        headers: { Authorization: accessToken }
      });
      const newMilestone = response.data.data;
      
      // Update local state
      set((state) => ({
        goals: state.goals.map((g) => 
          g.id === goalId 
            ? { ...g, milestones: [...(g.milestones || []), newMilestone] } 
            : g
        )
      }));
      
      return newMilestone;
    } catch (error) {
      throw error;
    }
  },

  updateMilestone: async (goalId, milestoneId, milestoneData) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.patch(`${API_URL}/goals/milestones/${milestoneId}`, milestoneData, {
        headers: { Authorization: accessToken }
      });
      const updatedMilestone = response.data.data;
      
      set((state) => ({
        goals: state.goals.map((g) => 
          g.id === goalId 
            ? { 
                ...g, 
                milestones: g.milestones.map((m) => m.id === milestoneId ? updatedMilestone : m) 
              } 
            : g
        )
      }));
      
      return updatedMilestone;
    } catch (error) {
      throw error;
    }
  },

  deleteMilestone: async (goalId, milestoneId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.delete(`${API_URL}/goals/milestones/${milestoneId}`, {
        headers: { Authorization: accessToken }
      });
      
      set((state) => ({
        goals: state.goals.map((g) => 
          g.id === goalId 
            ? { 
                ...g, 
                milestones: g.milestones.filter((m) => m.id !== milestoneId) 
              } 
            : g
        )
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchGoalActivity: async (goalId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.get(`${API_URL}/goals/${goalId}/activity`, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      return [];
    }
  },

  fetchWorkspaceMembers: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/workspaces/${workspaceId}/members`, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  inviteMember: async (workspaceId, inviteData) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/workspaces/${workspaceId}/invite`, inviteData, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useWorkspaceStore;
