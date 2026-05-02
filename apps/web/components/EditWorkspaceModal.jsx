"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Palette, ShieldCheck, Command } from 'lucide-react';
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

export default function EditWorkspaceModal({ workspace, isOpen, onClose }) {
  const { updateWorkspace } = useWorkspaceStore();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(workspaceSchema),
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description || '',
        accentColor: workspace.accentColor,
      });
      setSelectedColor(workspace.accentColor);
    }
  }, [workspace, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateWorkspace(workspace.id, { ...data, accentColor: selectedColor });
      Swal.fire({
        title: 'Update Successful',
        text: `"${data.name}" has been updated.`,
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: selectedColor,
      });
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        background: '#0a0a0a',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl animate-in zoom-in-95 duration-300">
        <div 
          className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-[80px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: selectedColor }}
        />

        <div className="relative flex items-center justify-between border-b border-white/5 p-8 bg-white/[0.02]">
          <div className="flex items-center space-x-4">
             <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Palette className="h-6 w-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase leading-none">Modify Hub</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">Updating Base Protocol</p>
             </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-3 text-white/30 hover:bg-white/5 hover:text-white transition-all">
            <X className="h-5 w-5 stroke-[3px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative p-10 space-y-10">
          <div className="space-y-8">
            <div className="group">
              <label className="flex items-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Workspace Identity</label>
              <input
                {...register('name')}
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] py-5 px-6 text-white placeholder-white/20 focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/5 sm:text-base font-bold transition-all"
              />
              {errors.name && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest">{errors.name.message}</p>}
            </div>

            <div>
              <label className="flex items-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Briefing</label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] py-5 px-6 text-white placeholder-white/20 focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/5 sm:text-base font-medium transition-all resize-none"
              />
            </div>

            <div>
              <label className="flex items-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Signature Color</label>
              <div className="flex flex-wrap gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-xl border-4 transition-all relative ${
                      selectedColor === color ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <ShieldCheck className="h-4 w-4 text-white" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 py-5 text-xs font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex justify-center items-center rounded-[1.5rem] py-5 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: selectedColor }}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
