"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  Megaphone, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import useWorkspaceStore from '../store/useWorkspaceStore';

const navItems = [
  { name: 'Dashboard', href: '/goals', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Action Items', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspaceStore();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-[#0a0a0a] text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold">T</div>
          <span className="text-lg font-bold tracking-tight">TeamHub</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-8 px-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Current Workspace
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center space-x-3 truncate">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: currentWorkspace?.accentColor || '#3b82f6' }}
              />
              <span className="truncate text-sm font-medium">
                {currentWorkspace?.name || 'Loading...'}
              </span>
            </div>
            <Link href="/workspaces">
              <ChevronLeft className="h-4 w-4 text-gray-500 hover:text-white" />
            </Link>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10",
                pathname === item.href ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5",
                pathname === item.href ? "text-primary" : "text-gray-500 group-hover:text-white"
              )} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <button className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <Settings className="mr-3 h-5 w-5 text-gray-500" />
          Settings
        </button>
        <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
