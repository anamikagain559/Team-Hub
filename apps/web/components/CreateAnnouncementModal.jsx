"use client";
import React, { useState } from 'react';
import { X, Loader2, Megaphone, Pin } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Swal from 'sweetalert2';

export default function CreateAnnouncementModal({ isOpen, onClose }) {
  const { currentWorkspace, createAnnouncement } = useWorkspaceStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    if (formData.content.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Message too short',
        text: 'Please write at least 10 characters for your announcement.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createAnnouncement({
        ...formData,
        workspaceId: currentWorkspace.id,
      });
      
      onClose();
      setFormData({ title: '', content: '', isPinned: false });

      Swal.fire({
        icon: 'success',
        title: 'Published!',
        text: 'Your announcement is live.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Failed to create announcement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong.',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">New Announcement</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                Posting to {currentWorkspace?.name}
              </p>
            </div>
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
            <label className="text-sm font-medium text-slate-300">Title</label>
            <input
              required
              type="text"
              placeholder="E.g., Q3 All Hands Meeting"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Message</label>
            <textarea
              required
              minLength={10}
              rows={6}
              placeholder="What do you want to share with the team? (Minimum 10 characters)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            />
            {formData.content.length > 0 && formData.content.trim().length < 10 && (
              <p className="text-xs text-red-400">Message must be at least 10 characters.</p>
            )}
          </div>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center h-5 w-5 rounded border border-white/20 bg-white/5 group-hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="peer sr-only"
              />
              <Pin className={`h-3 w-3 transition-opacity ${formData.isPinned ? 'opacity-100 text-primary' : 'opacity-0'}`} />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Pin to top of the feed
            </span>
          </label>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={isLoading || !formData.title.trim()}
              type="submit"
              className="flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
