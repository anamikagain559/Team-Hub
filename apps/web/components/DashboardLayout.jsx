"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function DashboardLayout({ children }) {
  const { accessToken } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  if (!mounted || !accessToken) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <CommandPalette />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-white/10 px-8">
          <h2 className="text-lg font-semibold tracking-tight">
            {currentWorkspace?.name || 'Workspace'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
