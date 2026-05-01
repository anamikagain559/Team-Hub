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
  ChevronLeft,
  User,
  Grid
} from 'lucide-react';
import { cn } from '../lib/utils';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useAuthStore from '../store/useAuthStore';
import { useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/goals', icon: LayoutDashboard },
  { name: 'Workspaces', href: '/workspaces', icon: Grid },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Action Items', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspaceStore();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-[#0a0a0a] text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold">T</div>
          <span className="text-lg font-bold tracking-tight">TeamHub</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
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
        <Link 
          href="/profile"
          className={cn(
            "flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-white/10",
            pathname === '/profile' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="mr-3 h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="mr-3 h-5 w-5 text-gray-500" />
          )}
          Profile
        </Link>
        <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
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
