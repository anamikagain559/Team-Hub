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
      
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-6 bg-muted/30">
          <h2 className="text-xl font-black tracking-tight text-foreground uppercase">Create Workspace</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <X className="h-5 w-5 stroke-[3px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Workspace Name</label>
              <input
                {...register('name')}
                placeholder="e.g. Design Team, Q3 Roadmap"
                className="mt-3 block w-full rounded-2xl border border-border bg-muted/50 py-4 px-5 text-foreground placeholder-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 sm:text-sm font-medium transition-all"
              />
              {errors.name && <p className="mt-2 text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Description (Optional)</label>
              <textarea
                {...register('description')}
                placeholder="What is this workspace for?"
                rows={3}
                className="mt-3 block w-full rounded-2xl border border-border bg-muted/50 py-4 px-5 text-foreground placeholder-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 sm:text-sm font-medium transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center">
                <Palette className="mr-2 h-3.5 w-3.5" />
                Accent Color
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-9 w-9 rounded-full border-4 transition-all shadow-sm ${
                      selectedColor === color ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border bg-muted/50 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-foreground hover:text-background transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
