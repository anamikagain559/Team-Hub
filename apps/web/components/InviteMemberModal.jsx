'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Mail, Shield } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Swal from 'sweetalert2';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export default function InviteMemberModal({ isOpen, onClose, workspaceId, onInviteSuccess }) {
  const { inviteMember } = useWorkspaceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' }
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await inviteMember(workspaceId, data);
      Swal.fire({
        title: 'Invited!',
        text: 'The member has been successfully invited.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
      onInviteSuccess();
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                <Mail className="mr-2 h-3 w-3" />
                Email Address
              </label>
              <input
                {...register('email')}
                placeholder="colleague@example.com"
                className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                <Shield className="mr-2 h-3 w-3" />
                Role
              </label>
              <select
                {...register('role')}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm appearance-none"
              >
                <option value="MEMBER" className="bg-slate-900 text-white">Member (Can edit tasks/goals)</option>
                <option value="ADMIN" className="bg-slate-900 text-white">Admin (Full workspace control)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

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
              className="flex-1 flex justify-center items-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
