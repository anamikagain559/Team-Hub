"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import NotificationPopover from './NotificationPopover';
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
    <div 
      className="flex h-screen bg-background text-foreground overflow-hidden transition-all duration-700 ease-in-out"
      style={{ 
        '--workspace-color': currentWorkspace?.accentColor || '#3b82f6',
        '--workspace-color-muted': `${currentWorkspace?.accentColor || '#3b82f6'}20`
      }}
    >
      {/* Background Workspace Glow */}
      <div 
        className="fixed -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px] transition-all duration-1000 pointer-events-none"
        style={{ backgroundColor: 'var(--workspace-color)' }}
      />
      <div 
        className="fixed -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-5 blur-[100px] transition-all duration-1000 pointer-events-none"
        style={{ backgroundColor: 'var(--workspace-color)' }}
      />

      <CommandPalette />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <header className="flex h-16 items-center justify-between border-b border-border px-8 bg-card/50 backdrop-blur-md relative z-50">
          <div className="flex items-center space-x-4">
            <div 
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-black shadow-lg transition-all duration-500 hover:scale-110"
              style={{ backgroundColor: 'var(--workspace-color)' }}
            >
              {currentWorkspace?.name?.charAt(0)}
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase group flex items-center">
              <span className="text-muted-foreground mr-2 opacity-50">/</span>
              {currentWorkspace?.name || 'Workspace'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationPopover />
            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-xs font-black text-primary">{user?.name?.charAt(0)}</span>
               )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
