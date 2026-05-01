"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { X, Loader2, Layout, Palette } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Swal from 'sweetalert2';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  accentColor: z.string().default('#3b82f6'),
});

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
];

export default function CreateWorkspaceModal({ isOpen, onClose }) {
  const { createWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(workspaceSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const workspace = await createWorkspace({ ...data, accentColor: selectedColor });
      setCurrentWorkspace(workspace);
      Swal.fire({
        title: 'Workspace Created!',
        text: `Your workspace "${workspace.name}" is ready.`,
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
      reset();
      onClose();
      router.push('/goals');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Create Workspace</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Workspace Name</label>
              <input
                {...register('name')}
                placeholder="e.g. Design Team, Q3 Roadmap"
                className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description (Optional)</label>
              <textarea
                {...register('description')}
                placeholder="What is this workspace for?"
                rows={3}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                <Palette className="mr-2 h-3 w-3" />
                Accent Color
              </label>
              <div className="mt-3 flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
