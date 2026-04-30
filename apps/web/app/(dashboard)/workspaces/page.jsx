"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layout, Settings, Users, LogOut, ChevronRight } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import useAuthStore from '../../../store/useAuthStore';
import CreateWorkspaceModal from '../../../components/CreateWorkspaceModal';

export default function WorkspacesPage() {
  const { workspaces, fetchWorkspaces, setCurrentWorkspace, isLoading } = useWorkspaceStore();
  const { logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    router.push('/goals');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
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
                <div className="mt-6 flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    Members
                  </span>
                  <span className="flex items-center">
                    <Settings className="mr-1 h-3 w-3" />
                    Settings
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 flex justify-center">
          <button 
            onClick={logout}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
