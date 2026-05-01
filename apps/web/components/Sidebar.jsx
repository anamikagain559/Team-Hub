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
import Swal from 'sweetalert2';

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
  const { user, fetchMe, logout } = useAuthStore();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out of your account?',
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

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/[0.05] bg-[#080808] text-white">
      {/* Branding */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
            {currentWorkspace ? currentWorkspace.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-black tracking-tighter uppercase truncate w-32" title={currentWorkspace?.name || 'TeamHub'}>
              {currentWorkspace ? currentWorkspace.name : 'TeamHub'}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] -mt-1">Workspace</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        <div>
          <h3 className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">General</h3>
          <nav className="space-y-1">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200",
                  pathname === item.href 
                    ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10" 
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 stroke-[2.5px]",
                  pathname === item.href ? "text-white" : "text-slate-600 group-hover:text-slate-400"
                )} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Insights</h3>
          <nav className="space-y-1">
            {navItems.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200",
                  pathname === item.href 
                    ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10" 
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 stroke-[2.5px]",
                  pathname === item.href ? "text-white" : "text-slate-600 group-hover:text-slate-400"
                )} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User & Settings */}
      <div className="border-t border-white/[0.05] p-4 bg-white/[0.01]">
        <div className="flex flex-col space-y-1">
          <Link 
            href="/profile"
            className={cn(
              "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all hover:bg-white/5 group",
              pathname === '/profile' ? "text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <div className="relative mr-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center ring-1 ring-white/10">
                  <User className="h-3 w-3 text-slate-500" />
                </div>
              )}
              <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#080808] bg-green-500" />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="truncate w-full leading-none">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-600 mt-0.5 truncate w-full uppercase tracking-wider">Free Plan</span>
            </div>
          </Link>

          <div className="space-y-1 mt-3">
            <Link 
              href="/profile"
              className={cn(
                "flex items-center rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-white/10",
                pathname === '/profile' ? "bg-white/10 text-white" : "text-slate-600 hover:bg-white/5 hover:text-white"
              )}
            >
              <User className="h-3.5 w-3.5 mr-3" />
              Profile
            </Link>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button className="flex items-center justify-center rounded-xl py-2 text-slate-600 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10 text-[10px] font-black uppercase tracking-widest" title="Settings">
                <Settings className="h-3.5 w-3.5 mr-2" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center rounded-xl py-2 text-slate-600 hover:bg-red-500/5 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10 text-[10px] font-black uppercase tracking-widest" title="Logout"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
