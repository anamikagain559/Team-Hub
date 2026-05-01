'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, UserPlus, Shield, Mail, Loader2, MoreVertical, Trash2, UserCog, Eye } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import useAuthStore from '@/store/useAuthStore';
import InviteMemberModal from '@/components/InviteMemberModal';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function TeamPage() {
  const { currentWorkspace, fetchWorkspaceMembers, updateMemberRole, removeMember, fetchWorkspaces } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const highlightUserId = searchParams.get('highlight');

  useEffect(() => {
    setMounted(true);
    if (!currentWorkspace) {
      fetchWorkspaces();
    }
  }, []);

  const loadMembers = async () => {
    if (currentWorkspace) {
      setIsLoading(true);
      try {
        const data = await fetchWorkspaceMembers(currentWorkspace.id);
        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      loadMembers();
    }
  }, [currentWorkspace, mounted]);

  if (!mounted) return null;

  const handleUpdateRole = async (member) => {
    const { value: role } = await Swal.fire({
      title: 'Change Member Role',
      input: 'select',
      inputOptions: {
        ADMIN: 'Admin',
        MEMBER: 'Member'
      },
      inputValue: member.role,
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#2563eb',
    });

    if (role && role !== member.role) {
      try {
        await updateMemberRole(member.id, role);
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          background: '#0f172a',
          color: '#fff',
        });
        loadMembers();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.message,
          background: '#0f172a',
          color: '#fff',
        });
      }
    }
  };

  const handleRemoveMember = async (member) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Remove ${member.user.name} from this workspace?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, remove them',
      background: '#0f172a',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        await removeMember(member.id);
        Swal.fire({
          icon: 'success',
          title: 'Member Removed',
          background: '#0f172a',
          color: '#fff',
        });
        loadMembers();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Removal Failed',
          text: error.message,
          background: '#0f172a',
          color: '#fff',
        });
      }
    }
  };

  const handleViewDetails = (member) => {
    Swal.fire({
      title: `<span class="text-white">${member.user.name}</span>`,
      html: `
        <div class="text-left space-y-4 py-4">
          <div class="flex items-center space-x-3">
            <div class="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
              ${member.user.avatar ? `<img src="${member.user.avatar}" class="h-full w-full object-cover" />` : '<i class="fas fa-user text-2xl text-slate-400"></i>'}
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">User ID</p>
              <p class="text-white font-mono text-xs">${member.user.id}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">Email Address</p>
              <p class="text-white">${member.user.email}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">Workspace Role</p>
              <p class="text-white">${member.role}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">Joined Date</p>
              <p class="text-white">${new Date(member.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      `,
      background: '#0f172a',
      color: '#fff',
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Team Members</h1>
              <p className="mt-1 text-slate-400 font-medium">Manage collaborators in {currentWorkspace?.name}</p>
            </div>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="mr-2 h-4 w-4 stroke-[3px]" />
              Invite Member
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-white/10 bg-[#080808] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-8 py-5">Member</th>
                      <th className="px-8 py-5">Workspace Role</th>
                      <th className="px-8 py-5">Access Since</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((member) => (
                      <tr 
                        key={member.id} 
                        className={cn(
                          "group hover:bg-white/[0.02] transition-colors",
                          highlightUserId === member.user.id ? "bg-blue-600/10" : ""
                        )}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="h-11 w-11 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-blue-600/30 transition-all">
                              {member.user.avatar ? (
                                <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <Users className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-base">{member.user.name} {member.user.id === currentUser?.id && <span className="text-[10px] font-black bg-blue-600/20 text-blue-500 px-2 py-0.5 rounded-full ml-1 uppercase tracking-widest">You</span>}</div>
                              <div className="text-xs text-slate-500 flex items-center mt-0.5 font-medium">
                                <Mail className="h-3 w-3 mr-1.5 opacity-50" />
                                {member.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            member.role === 'ADMIN' 
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5" 
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5"
                          )}>
                            <Shield className="mr-1.5 h-3 w-3" />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-400 font-bold tracking-tight">
                          {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right relative">
                          <div className="flex justify-end items-center space-x-1">
                            <button 
                              onClick={() => handleViewDetails(member)}
                              className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(member)}
                              className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                              title="Edit Role"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleRemoveMember(member)}
                              disabled={member.user.id === currentUser?.id}
                              className={cn(
                                "p-2 transition-all rounded-xl",
                                member.user.id === currentUser?.id 
                                  ? "opacity-20 cursor-not-allowed text-slate-700" 
                                  : "text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                              )}
                              title="Remove Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {members.length === 0 && (
                <div className="rounded-[2rem] border-2 border-dashed border-white/5 p-16 text-center bg-white/[0.01]">
                  <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                    <Users className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">No members yet</h3>
                  <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">Invite your teammates to start building amazing things together in this workspace.</p>
                </div>
              )}
            </div>
          )}

          {currentWorkspace && (
            <InviteMemberModal 
              isOpen={isInviteModalOpen} 
              onClose={() => setIsInviteModalOpen(false)}
              workspaceId={currentWorkspace.id}
              onInviteSuccess={loadMembers}
            />
          )}
        </div>
    </DashboardLayout>
  );
}

