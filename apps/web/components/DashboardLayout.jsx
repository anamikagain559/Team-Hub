"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function DashboardLayout({ children }) {
  const { accessToken, fetchMe, user } = useAuthStore();
  const { currentWorkspace, fetchWorkspaces, workspaces } = useWorkspaceStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (!accessToken) {
      router.push('/login');
    } else {
      if (!user) fetchMe();
      if (workspaces.length === 0) fetchWorkspaces();
    }
  }, [accessToken, router, user, workspaces.length]);

  if (!mounted || !accessToken) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <CommandPalette />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border px-8 bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-black tracking-tight uppercase">
            {currentWorkspace?.name || 'Workspace'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
