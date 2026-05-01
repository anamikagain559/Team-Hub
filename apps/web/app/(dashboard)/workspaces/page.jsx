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
      <div className="max-w-5xl py-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Workspaces</h1>
            <p className="mt-2 text-gray-400">Select a workspace to start collaborating</p>
          </div>
          <button 
            className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && workspaces.length === 0 ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Layout className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-white">No workspaces found</h3>
              <p className="mt-2 text-gray-400">Create your first workspace to get started</p>
            </div>
          ) : (
            workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => handleSelectWorkspace(ws)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-primary/50 hover:bg-white/10"
              >
                <div 
                  className="absolute top-0 left-0 h-1 w-full" 
                  style={{ backgroundColor: ws.accentColor }}
                />
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Layout className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 text-xl font-bold">{ws.name}</h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                  {ws.description || 'No description provided'}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {ws.members?.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        title={member.user.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentWorkspace(ws);
                          router.push(`/team?highlight=${member.user.id}`);
                        }}
                        className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-110 transition-transform relative z-10 hover:z-20"
                      >
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold">{member.user.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                    {ws.members?.length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-slate-800 text-[10px] font-bold text-gray-400 relative z-0">
                        +{ws.members.length - 5}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleInviteClick(e, ws)}
                    className="flex items-center rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                  >
                    <UserPlus className="mr-1.5 h-3 w-3" />
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
