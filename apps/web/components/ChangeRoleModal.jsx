import React, { useState } from 'react';
import { X, Shield, User, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChangeRoleModal({ isOpen, onClose, member, onUpdate }) {
  const [selectedRole, setSelectedRole] = useState(member?.role || 'MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const roles = [
    {
      id: 'MEMBER',
      name: 'Member',
      description: 'Can manage tasks and goals, but cannot manage team or workspace settings.',
      icon: User,
      color: 'blue'
    },
    {
      id: 'ADMIN',
      name: 'Administrator',
      description: 'Full control over the workspace, including inviting/removing members and settings.',
      icon: Shield,
      color: 'purple'
    }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(member.id, selectedRole);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080808] shadow-2xl animate-in zoom-in-95 duration-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Change Role</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Managing {member.user.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full flex items-start p-5 rounded-3xl border transition-all text-left group relative overflow-hidden",
                  isSelected 
                    ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center mr-4 shrink-0 transition-all",
                  isSelected ? "bg-primary text-white" : "bg-white/5 text-slate-400 group-hover:text-white"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className={cn(
                    "font-black uppercase tracking-widest text-[11px] mb-1",
                    isSelected ? "text-primary" : "text-slate-300"
                  )}>
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-5 right-5 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white animate-in zoom-in duration-300">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRole === member.role}
            className="w-full flex justify-center items-center rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Role Update'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
