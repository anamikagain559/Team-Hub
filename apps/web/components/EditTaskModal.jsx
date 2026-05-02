import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, Flag, User, Target, Loader2 } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Swal from 'sweetalert2';

export default function EditTaskModal({ isOpen, onClose, task }) {
  const { currentWorkspace, updateTask, fetchWorkspaceMembers, goals, fetchGoals } = useWorkspaceStore();
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    goalId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigneeId: task.assigneeId || '',
        goalId: task.goalId || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
      
      if (currentWorkspace) {
        fetchWorkspaceMembers(currentWorkspace.id).then(setMembers);
        fetchGoals(currentWorkspace.id);
      }
    }
  }, [isOpen, task, currentWorkspace]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        ...formData,
        goalId: formData.goalId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Task Updated',
        background: '#0f172a',
        color: '#fff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update task.',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080808] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Action Item</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all min-h-[100px] shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                <User className="w-3.5 h-3.5 mr-2" /> Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none shadow-inner"
                required
              >
                {members.map(member => (
                  <option key={member.user.id} value={member.user.id} className="bg-[#080808]">
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                <Target className="w-3.5 h-3.5 mr-2" /> Goal
              </label>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none shadow-inner"
              >
                <option value="" className="bg-[#080808]">None</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id} className="bg-[#080808]">
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                 Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none shadow-inner"
              >
                <option value="TODO" className="bg-[#080808]">TODO</option>
                <option value="IN_PROGRESS" className="bg-[#080808]">ACTIVE</option>
                <option value="DONE" className="bg-[#080808]">DONE</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end space-x-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center rounded-2xl bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
