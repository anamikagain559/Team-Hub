'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, Loader2, MoreVertical, Trash2, UserCog, Eye } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import useAuthStore from '@/store/useAuthStore';
import InviteMemberModal from '@/components/InviteMemberModal';
import ChangeRoleModal from '@/components/ChangeRoleModal';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useSocket } from '@/context/SocketContext';

export default function TeamPage() {
  const { currentWorkspace, fetchWorkspaceMembers, updateMemberRole, removeMember, fetchWorkspaces, fetchAllUsers, can } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();
  const { onlineUsers } = useSocket();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [memberToUpdate, setMemberToUpdate] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState('workspace'); // 'workspace' or 'global'
  const searchParams = useSearchParams();
  const highlightUserId = searchParams.get('highlight');

  useEffect(() => {
    setMounted(true);
    if (!currentWorkspace) {
      fetchWorkspaces();
    }
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      let data;
      if (viewMode === 'global') {
        data = await fetchAllUsers();
        data = data.map(u => ({
          id: `global-${u.id}`,
          role: u.role,
          createdAt: u.createdAt,
          user: u,
          isGlobal: true
        }));
      } else if (currentWorkspace) {
        data = await fetchWorkspaceMembers(currentWorkspace.id);
      }
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadMembers();
    }
  }, [currentWorkspace, mounted, viewMode]);

  if (!mounted) return null;

  const handleUpdateRole = (member) => {
    setMemberToUpdate(member);
    setIsRoleModalOpen(true);
  };

  const onConfirmRoleUpdate = async (memberId, role) => {
    try {
      await updateMemberRole(currentWorkspace.id, memberId, role);
      Swal.fire({
        icon: 'success',
        title: 'Role Updated',
        background: '#0f172a',
        color: '#fff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
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
  };

  const handleRemoveMember = async (member) => {
    const result = await Swal.fire({
      title: 'Remove Member?',
      text: `Are you sure you want to remove ${member.user.name} from this workspace?`,
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, remove them'
    });

    if (result.isConfirmed) {
      try {
        await removeMember(currentWorkspace.id, member.id);
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
    <>
      <div className="animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Team Hub</h1>
              <p className="mt-1 text-muted-foreground font-bold uppercase tracking-[0.15em] text-[10px]">
                {viewMode === 'workspace' ? `Active Collaborators in ${currentWorkspace?.name}` : 'Global User Directory'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex p-1 bg-muted/50 border border-border rounded-2xl">
                <button 
                  onClick={() => setViewMode('workspace')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'workspace' ? "bg-background text-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Workspace
                </button>
                <button 
                  onClick={() => setViewMode('global')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'global' ? "bg-background text-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Global DB
                </button>
              </div>

              {viewMode === 'workspace' && can('INVITE_MEMBER') && (
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus className="mr-2 h-4 w-4 stroke-[3px]" />
                  Invite Member
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-border bg-card overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-8 py-5">Member</th>
                      <th className="px-8 py-5">{viewMode === 'workspace' ? 'Workspace Role' : 'System Role'}</th>
                      <th className="px-8 py-5">{viewMode === 'workspace' ? 'Access Since' : 'Joined Date'}</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((member) => (
                      <tr 
                        key={member.id} 
                        className={cn(
                          "group hover:bg-muted/50 transition-colors",
                          highlightUserId === member.user.id ? "bg-primary/10" : ""
                        )}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                             <div className="relative h-12 w-12 shrink-0">
                               <div className={cn(
                                 "h-full w-full rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 transition-all duration-500",
                                 onlineUsers.has(member.user.id) 
                                   ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-[#0a0a0a]" 
                                   : "border-border"
                               )}>
                                 {member.user.avatar ? (
                                   <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                                 ) : (
                                   <Users className="h-5 w-5 text-muted-foreground" />
                                 )}
                               </div>
                               
                               {/* Overflowing Online status indicator */}
                               {onlineUsers.has(member.user.id) && (
                                 <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                   <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                 </div>
                               )}
                             </div>
                             <div>
                               <div className="font-bold text-foreground text-base flex items-center">
                                 {member.user.name} 
                                 {onlineUsers.has(member.user.id) && (
                                   <div className="ml-3 flex items-center bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                     <div className="h-1 w-1 rounded-full bg-green-500 mr-1.5 shadow-[0_0_8px_rgba(34,197,94,1)] animate-pulse" />
                                     <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Live</span>
                                   </div>
                                 )}
                                 {member.user.id === currentUser?.id && <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-1 uppercase tracking-widest">You</span>}
                               </div>
                              <div className="text-xs text-muted-foreground flex items-center mt-0.5 font-medium">
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
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/5" 
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                          )}>
                            <Shield className="mr-1.5 h-3 w-3" />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-muted-foreground font-bold tracking-tight">
                          {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right relative">
                          <div className="flex justify-end items-center space-x-1">
                            <button 
                              onClick={() => handleViewDetails(member)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {viewMode === 'workspace' && can('MANAGE_MEMBERS') && (
                              <>
                                <button 
                                  onClick={() => handleUpdateRole(member)}
                                  className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-all"
                                  title="Edit Role"
                                >
                                  Edit Role
                                </button>
                                <button 
                                  onClick={() => handleRemoveMember(member)}
                                  disabled={member.user.id === currentUser?.id}
                                  className={cn(
                                    "p-2 transition-all rounded-xl",
                                    member.user.id === currentUser?.id 
                                      ? "opacity-20 cursor-not-allowed text-muted" 
                                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  )}
                                  title="Remove Member"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {members.length === 0 && (
                <div className="rounded-[2rem] border-2 border-dashed border-border p-16 text-center bg-card">
                  <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6 ring-1 ring-border">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">No members yet</h3>
                  <p className="mt-2 text-muted-foreground font-medium max-w-xs mx-auto">Invite your teammates to start building amazing things together in this workspace.</p>
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

          <ChangeRoleModal
            isOpen={isRoleModalOpen}
            onClose={() => {
              setIsRoleModalOpen(false);
              setMemberToUpdate(null);
            }}
            member={memberToUpdate}
            onUpdate={onConfirmRoleUpdate}
          />
        </div>
    </>
  );
}
