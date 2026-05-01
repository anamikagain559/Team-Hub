"use client";
import React, { useState, useEffect } from 'react';
import { X, Loader2, Target, Calendar, Clock, User } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useAuthStore from '../store/useAuthStore';
import Swal from 'sweetalert2';

export default function EditGoalModal({ goal, isOpen, onClose }) {
  const { updateGoal, currentWorkspace, fetchWorkspaceMembers } = useWorkspaceStore();
  const [formData, setFormData] = useState({
    title: '',
    ownerId: '',
    dueDate: '',
    status: 'TODO',
  });
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        ownerId: goal.ownerId || '',
        dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '',
        status: goal.status || 'TODO',
      });
    }
    if (isOpen && currentWorkspace) {
      loadMembers();
    }
  }, [goal, isOpen, currentWorkspace]);

  const loadMembers = async () => {
    setIsFetchingMembers(true);
    try {
      const data = await fetchWorkspaceMembers(currentWorkspace.id);
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsFetchingMembers(false);
    }
  };

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateGoal(goal.id, formData);
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Goal Updated!',
        text: 'Your goal has been updated successfully.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Something went wrong.',
        background: '#0f172a',
        color: '#fff'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Edit Goal</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center">
              <Target className="h-4 w-4 mr-2 text-slate-500" />
              Goal Title
            </label>
            <input
              required
              type="text"
              placeholder="e.g., Launch Q3 Marketing Campaign"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center">
              <User className="h-4 w-4 mr-2 text-slate-500" />
              Goal Owner
            </label>
            <select
              required
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#1a1f2e] px-4 py-2.5 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
              {isFetchingMembers ? (
                <option value="">Loading members...</option>
              ) : (
                <option value="">Select Owner</option>
              )}
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                Target Date
              </label>
              <input
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-slate-500" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#1a1f2e] px-4 py-2.5 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className="flex-1 flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
