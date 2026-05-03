"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import useAuthStore from '@/store/useAuthStore';
import Swal from 'sweetalert2';
import { 
  Plus, 
  Layout, 
  Settings, 
  Users, 
  ChevronRight, 
  UserPlus, 
  Grid, 
  Trash2, 
  LogOut,
  Sparkles,
  Command,
  ArrowRight,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EditWorkspaceModal from '@/components/EditWorkspaceModal';

export default function WorkspacesPage() {
  const { workspaces, fetchWorkspaces, setCurrentWorkspace, deleteWorkspace, isLoading } = useWorkspaceStore();
  const { accessToken, user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedWsForInvite, setSelectedWsForInvite] = useState(null);
  const [selectedWsForEdit, setSelectedWsForEdit] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetchWorkspaces();
  }, [accessToken]);

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Sign Out',
      background: '#0f172a',
      color: '#fff',
    });

    if (result.isConfirmed) {
      await logout();
      window.location.href = '/login';
    }
  };

  const handleInviteClick = (e, workspace) => {
    e.stopPropagation();
    setSelectedWsForInvite(workspace);
    setIsInviteModalOpen(true);
  };

  const handleEditClick = (e, workspace) => {
    e.stopPropagation();
    setSelectedWsForEdit(workspace);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (e, workspace) => {
    e.stopPropagation();
    
    const { value: confirmName } = await Swal.fire({
      title: 'Delete Workspace?',
      text: `To confirm, type the name of the hub: "${workspace.name}"`,
      input: 'text',
      inputPlaceholder: workspace.name,
      showCancelButton: true,
      background: '#0a0a0a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Confirm Deletion',
      customClass: {
        popup: 'rounded-[2rem] border border-white/10 shadow-2xl',
        input: 'rounded-xl bg-white/5 border-white/10 text-white'
      }
    });

    if (confirmName?.trim().toLowerCase() === workspace.name.trim().toLowerCase()) {
      try {
        await deleteWorkspace(workspace.id);
        Swal.fire({
          icon: 'success',
          title: 'Deployment Terminated',
          text: 'The workspace and all its data have been removed.',
          background: '#0a0a0a',
          color: '#fff',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.response?.data?.message || error.message,
          background: '#0a0a0a',
          color: '#fff',
        });
      }
    } else if (confirmName) {
      Swal.fire({
        icon: 'warning',
        title: 'Identity Mismatch',
        text: 'The hub name you entered does not match. Aborting deletion.',
        background: '#0a0a0a',
        color: '#fff',
      });
    }
  };

  if (!mounted) return null;
  if (!accessToken) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
      </div>

      <div className="relative max-w-7xl mx-auto py-20 px-6 lg:px-8">
        {/* Modern Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Workspace</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white lg:text-6xl">
              Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
              Your digital command center is ready. Access your hubs or establish a new base of operations.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
             {user?.role === 'ADMIN' && (
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group flex items-center space-x-3 px-5 py-2.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="h-4 w-4 stroke-[4px]" />
                  <span>New Hub</span>
                </button>
             )}

             <button 
                onClick={handleLogout}
                className="group flex items-center space-x-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold leading-none">{user?.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/30 group-hover:text-primary transition-colors">Sign Out</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                  <LogOut className="h-4 w-4 group-hover:text-primary transition-colors" />
                </div>
              </button>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && workspaces.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center">
               <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
                  <div className="relative h-full w-full rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.5)]">
                    <Command className="h-8 w-8 text-white animate-spin duration-[3000ms]" />
                  </div>
               </div>
               <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-white/30 animate-pulse">Synchronizing Data...</p>
            </div>
          ) : (
            <>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws)}
                  className="group relative flex flex-col cursor-pointer transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Glass Card Container */}
                  <div className="relative h-full flex flex-col rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 overflow-hidden group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all">
                    
                    {/* Corner Accent */}
                    <div 
                      className="absolute -right-16 -top-16 h-32 w-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                      style={{ backgroundColor: ws.accentColor }}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-between relative z-10">
                      <div 
                        className="h-16 w-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{ backgroundColor: `${ws.accentColor}20`, border: `1px solid ${ws.accentColor}40` }}
                      >
                        <Grid className="h-8 w-8" style={{ color: ws.accentColor }} />
                      </div>
                      
                      {ws.currentUserRole === 'ADMIN' && (
                        <div className="flex items-center space-x-2 relative z-20">
                          <button 
                            onClick={(e) => handleEditClick(e, ws)}
                            className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                            title="Edit Hub"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, ws)}
                            className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-red-500 hover:border-red-500/50 transition-all shadow-sm"
                            title="Delete Hub"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="mt-10 relative z-10 flex-1">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                        {ws.name}
                      </h3>
                      <p className="mt-4 text-sm text-white/40 font-medium leading-relaxed line-clamp-2">
                        {ws.description || 'A high-performance workspace for collaborative excellence.'}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center">
                        <div className="flex -space-x-3">
                          {ws.members?.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="h-9 w-9 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center overflow-hidden transition-transform group-hover:translate-x-[-4px]"
                            >
                              {member.user.avatar ? (
                                <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-white/40">{member.user.name.charAt(0)}</span>
                              )}
                            </div>
                          ))}
                          {ws.members?.length > 3 && (
                            <div className="h-9 w-9 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                              +{ws.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                          {ws.members?.length || 0} Members
                        </span>
                      </div>

                      {ws.currentUserRole === 'ADMIN' && (
                        <button 
                          onClick={(e) => handleInviteClick(e, ws)}
                          className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-primary hover:border-primary transition-all"
                          title="Invite Members"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Hover Indicator */}
                    <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-700" style={{ backgroundColor: ws.accentColor }} />
                  </div>
                </div>
              ))}

              {/* Advanced Create Card */}
              {user?.role === 'ADMIN' && (
                <div 
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex flex-col transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="h-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/10 p-12 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer relative overflow-hidden">
                     {/* Animated Background Lines */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
                     </div>

                     <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-2xl">
                          <Plus className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Establish New Hub</h3>
                        <p className="mt-3 text-sm text-white/30 font-medium max-w-[180px]">Deploy a fresh collaborative workspace for your team.</p>
                        
                        <div className="mt-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-primary transition-colors">
                          <span>Begin Deployment</span>
                          <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-2 transition-transform" />
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Technical Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20 hover:opacity-100 transition-opacity duration-700">
           <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <span className="flex items-center"><div className="h-1 w-1 bg-green-500 rounded-full mr-2" /> Systems Active</span>
              <span className="flex items-center"><div className="h-1 w-1 bg-primary rounded-full mr-2" /> Base Protocol v2.4</span>
           </div>
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              &copy; 2026 TeamHub Digital Collective
           </div>
        </footer>
      </div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditWorkspaceModal
        workspace={selectedWsForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {selectedWsForInvite && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={selectedWsForInvite.id}
          onInviteSuccess={() => {}}
        />
      )}
    </div>
  );
}
