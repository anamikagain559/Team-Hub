import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-4940.up.railway.app/api/v1';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  currentWorkspaceId: typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null,
  goals: [],
  tasks: [],
  announcements: [],
  isLoading: false,
  isFetchingAnnouncements: false,

  fetchAnnouncements: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    set({ isFetchingAnnouncements: true });
    try {
      const response = await axios.get(`${API_URL}/announcements/${workspaceId}`, {
        headers: { Authorization: accessToken }
      });
      set({ announcements: response.data.data, isFetchingAnnouncements: false });
    } catch (error) {
      set({ isFetchingAnnouncements: false });
    }
  },

  createAnnouncement: async (announcementData) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.post(`${API_URL}/announcements`, announcementData, {
        headers: { Authorization: accessToken }
      });
      set((state) => {
        const exists = state.announcements.some((ann) => ann.id === response.data.data.id);
        if (exists) return { isLoading: false };
        return {
          announcements: [response.data.data, ...state.announcements],
          isLoading: false
        };
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addReaction: async (announcementId, emoji) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.post(`${API_URL}/announcements/${announcementId}/reactions`, { emoji }, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  },

  addComment: async (announcementId, content) => {
    const { accessToken } = useAuthStore.getState();
    const { user } = useAuthStore.getState();
    const previousAnnouncements = get().announcements;

    const tempComment = {
      id: `temp-${Date.now()}`,
      content,
      userId: user?.id,
      user: { id: user?.id, name: user?.name, avatar: user?.avatar },
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      announcements: state.announcements.map((ann) => {
        if (ann.id === announcementId) {
          return {
            ...ann,
            comments: [...(ann.comments || []), tempComment]
          };
        }
        return ann;
      })
    }));

    try {
      const response = await axios.post(`${API_URL}/announcements/${announcementId}/comments`, { content }, {
        headers: { Authorization: accessToken }
      });

      set((state) => ({
        announcements: state.announcements.map((ann) => {
          if (ann.id === announcementId) {
            return {
              ...ann,
              comments: (ann.comments || []).map(c => c.id === tempComment.id ? response.data.data : c)
            };
          }
          return ann;
        })
      }));
    } catch (error) {
      set({ announcements: previousAnnouncements });
      throw error;
    }
  },

  fetchWorkspaces: async () => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/workspaces`, {
        headers: { Authorization: accessToken }
      });

      const workspaces = response.data.data;
      const savedId = get().currentWorkspaceId;
      let workspaceToSet = null;

      if (savedId) {
        workspaceToSet = workspaces.find(w => w.id === savedId);
      }

      if (!workspaceToSet && workspaces.length > 0) {
        workspaceToSet = workspaces[0];
      }

      set({
        workspaces,
        currentWorkspace: workspaceToSet,
        currentWorkspaceId: workspaceToSet?.id || null,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setCurrentWorkspace: (workspace) => {
    if (typeof window !== 'undefined' && workspace) {
      localStorage.setItem('currentWorkspaceId', workspace.id);
    }
    set({
      currentWorkspace: workspace,
      currentWorkspaceId: workspace?.id || null
    });
  },

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
      set((state) => {
        const exists = state.goals.some((g) => g.id === newGoal.id);
        if (exists) return { isLoading: false };
        return {
          goals: [newGoal, ...state.goals],
          isLoading: false
        };
      });
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
    const previousGoals = get().goals;

    // Optimistic delete
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== goalId)
    }));

    try {
      await axios.delete(`${API_URL}/goals/${goalId}`, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      set({ goals: previousGoals });
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
    const previousGoals = get().goals;

    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
          : g
      )
    }));

    try {
      await axios.delete(`${API_URL}/goals/milestones/${milestoneId}`, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      set({ goals: previousGoals });
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

  fetchTasks: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/tasks/${workspaceId}`, {
        headers: { Authorization: accessToken }
      });
      set({ tasks: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: { Authorization: accessToken }
      });
      const newTask = response.data.data;
      set((state) => {
        const exists = state.tasks.some((t) => t.id === newTask.id);
        if (exists) return { isLoading: false };
        return {
          tasks: [newTask, ...state.tasks],
          isLoading: false
        };
      });
      return newTask;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const { accessToken } = useAuthStore.getState();
    const previousTasks = get().tasks;

    set({
      tasks: previousTasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
    });

    try {
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status }, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.patch(`${API_URL}/tasks/${taskId}`, taskData, {
        headers: { Authorization: accessToken }
      });
      const updatedTask = response.data.data;
      set((state) => ({
        tasks: (state.tasks || []).map(t => t.id === taskId ? response.data.data : t)
      }));
      return updatedTask;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    const { accessToken } = useAuthStore.getState();
    const previousTasks = get().tasks;

    // Optimistic delete
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
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

  updateMemberRole: async (memberId, role) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.patch(`${API_URL}/workspaces/members/${memberId}`, { role }, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  removeMember: async (memberId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.delete(`${API_URL}/workspaces/members/${memberId}`, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      throw error;
    }
  },

  fetchAllUsers: async () => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: accessToken }
      });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      return [];
    }
  },

  // RBAC Helper
  can: (action) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return false;

    const role = currentWorkspace.currentUserRole;

    const permissions = {
      ADMIN: [
        'CREATE_GOAL', 'UPDATE_GOAL', 'DELETE_GOAL',
        'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK',
        'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT',
        'INVITE_MEMBER', 'MANAGE_MEMBERS', 'UPDATE_WORKSPACE_SETTINGS'
      ],
      MEMBER: [
        'CREATE_TASK', 'UPDATE_TASK', // Members can only manage tasks
      ]
    };

    return permissions[role]?.includes(action) || false;
  },

  updateWorkspace: async (id, workspaceData) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      const response = await axios.patch(`${API_URL}/workspaces/${id}`, workspaceData, {
        headers: { Authorization: accessToken }
      });
      set((state) => ({
        workspaces: state.workspaces.map(w => w.id === id ? { ...w, ...response.data.data } : w),
        currentWorkspace: state.currentWorkspace?.id === id ? { ...state.currentWorkspace, ...response.data.data } : state.currentWorkspace,
        isLoading: false
      }));
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteWorkspace: async (id) => {
    const { accessToken } = useAuthStore.getState();
    set({ isLoading: true });
    try {
      await axios.delete(`${API_URL}/workspaces/${id}`, {
        headers: { Authorization: accessToken }
      });
      set((state) => {
        const remainingWorkspaces = state.workspaces.filter(w => w.id !== id);
        return {
          workspaces: remainingWorkspaces,
          currentWorkspace: state.currentWorkspace?.id === id ? (remainingWorkspaces[0] || null) : state.currentWorkspace,
          isLoading: false
        };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  inviteMember: async (workspaceId, data) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.post(`${API_URL}/workspaces/${workspaceId}/invite`, data, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  updateMemberRole: async (workspaceId, memberId, role) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.patch(`${API_URL}/workspaces/${workspaceId}/members/${memberId}`, { role }, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      throw error;
    }
  },

  removeMember: async (workspaceId, memberId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      await axios.delete(`${API_URL}/workspaces/${workspaceId}/members/${memberId}`, {
        headers: { Authorization: accessToken }
      });
    } catch (error) {
      throw error;
    }
  },

  fetchDashboardStats: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.get(`${API_URL}/analytics/stats/${workspaceId}`, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return null;
    }
  },

  fetchWorkspaceExportData: async (workspaceId) => {
    const { accessToken } = useAuthStore.getState();
    try {
      const response = await axios.get(`${API_URL}/analytics/export/${workspaceId}`, {
        headers: { Authorization: accessToken }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch export data:', error);
      throw error;
    }
  },
}));

export default useWorkspaceStore;
