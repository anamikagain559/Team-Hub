"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import CreateWorkspaceModal from '../../../components/CreateWorkspaceModal';
import InviteMemberModal from '../../../components/InviteMemberModal';
import DashboardLayout from '../../../components/DashboardLayout';
import { Plus, Layout, Settings, Users, ChevronRight, UserPlus, Grid } from 'lucide-react';

export default function WorkspacesPage() {
  const { workspaces, fetchWorkspaces, setCurrentWorkspace, isLoading } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedWsForInvite, setSelectedWsForInvite] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    router.push('/goals');
  };

  const handleInviteClick = (e, workspace) => {
    e.stopPropagation();
    setSelectedWsForInvite(workspace);
    setIsInviteModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.06] pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Your Hubs
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
              Elevate your team's workflow. Select a workspace to begin your next big mission.
            </p>
          </div>
          <button 
            className="flex items-center group relative overflow-hidden rounded-2xl bg-white text-slate-950 px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            Create Workspace
          </button>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && workspaces.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Workspaces...</p>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="col-span-full rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] p-20 text-center backdrop-blur-sm">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Layout className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white">The board is empty</h3>
              <p className="mt-3 text-slate-400 max-w-xs mx-auto">Build your first digital headquarters and start collaborating today.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-8 text-primary font-bold hover:underline"
              >
                Launch your first workspace →
              </button>
            </div>
          ) : (
            workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => handleSelectWorkspace(ws)}
                className="group relative flex flex-col cursor-pointer overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0c0c0c] p-8 transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-1"
              >
                {/* Background Accent Glow */}
                <div 
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700"
                  style={{ backgroundColor: ws.accentColor }}
                />
                
                <div className="flex items-start justify-between relative z-10">
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${ws.accentColor}20`, border: `1px solid ${ws.accentColor}40` }}
                  >
                    <Grid className="h-7 w-7" style={{ color: ws.accentColor }} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Settings logic */ }}
                      className="rounded-full p-2 text-slate-600 hover:bg-white/5 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-5 w-5 text-slate-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </div>

                <div className="mt-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
                    {ws.name}
                  </h3>
                  <p className="mt-3 text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                    {ws.description || 'Modern collaboration space for high-performing teams.'}
                  </p>
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between relative z-10">
                  <div className="flex items-center -space-x-3">
                    {ws.members?.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        title={member.user.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentWorkspace(ws);
                          router.push(`/team?highlight=${member.user.id}`);
                        }}
                        className="h-10 w-10 rounded-full border-[3px] border-[#0c0c0c] bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-115 hover:z-30 transition-all duration-300 ring-1 ring-white/10"
                      >
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-slate-400">{member.user.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                    {ws.members?.length > 4 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#0c0c0c] bg-[#1a1a1a] text-[10px] font-black text-slate-500 ring-1 ring-white/10">
                        +{ws.members.length - 4}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleInviteClick(e, ws)}
                    className="flex items-center rounded-xl bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/[0.08] hover:text-white transition-all border border-white/[0.05]"
                  >
                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                    Invite
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {selectedWsForInvite && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={selectedWsForInvite.id}
          onInviteSuccess={() => {}}
        />
      )}
    </DashboardLayout>
  );
}
