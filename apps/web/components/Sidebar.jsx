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
  Grid,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useAuthStore from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workspaces', href: '/workspaces', icon: Grid },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { name: 'Action Items', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace, can } = useWorkspaceStore();
  const { user, fetchMe, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = navItems.filter(item => {
    if (item.name === 'Settings' && !can('UPDATE_WORKSPACE_SETTINGS')) return false;
    return true;
  });

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out of your account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Sign Out',
      background: resolvedTheme === 'dark' ? '#0f172a' : '#fff',
      color: resolvedTheme === 'dark' ? '#fff' : '#0f172a',
    });

    if (result.isConfirmed) {
      await logout();
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchMe();
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-black/5 dark:border-white/[0.05] bg-white dark:bg-[#080808] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Branding */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xl shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
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
          <h3 className="px-3 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">General</h3>
          <nav className="space-y-1">
            {items.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 relative",
                  pathname === item.href 
                    ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-300"
                )}
              >
                {pathname === item.href && (
                  <div 
                    className="absolute left-0 w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: 'var(--workspace-color)' }}
                  />
                )}
                <item.icon className={cn(
                  "mr-3 h-4 w-4 stroke-[2.5px]",
                  pathname === item.href ? "" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                )} 
                style={{ color: pathname === item.href ? 'var(--workspace-color)' : undefined }}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Insights</h3>
          <nav className="space-y-1">
            {items.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 relative",
                  pathname === item.href 
                    ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-300"
                )}
              >
                {pathname === item.href && (
                  <div 
                    className="absolute left-0 w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: 'var(--workspace-color)' }}
                  />
                )}
                <item.icon className={cn(
                  "mr-3 h-4 w-4 stroke-[2.5px]",
                  pathname === item.href ? "" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                )} 
                style={{ color: pathname === item.href ? 'var(--workspace-color)' : undefined }}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User & Settings */}
      <div className="border-t border-black/5 dark:border-white/[0.05] p-4 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="flex flex-col space-y-1">
          {/* Theme Switcher Toggle */}
          <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl mb-4">
            <button 
              onClick={() => setTheme('light')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 rounded-xl transition-all",
                theme === 'light' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 rounded-xl transition-all",
                theme === 'dark' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-white"
              )}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 rounded-xl transition-all",
                theme === 'system' ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="System Preference"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          <Link 
            href="/dashboard/profile"
            className={cn(
              "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-white/5 group",
              pathname === '/dashboard/profile' ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <div className="relative mr-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                  <User className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                </div>
              )}
              <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#080808] bg-green-500" />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="truncate w-full leading-none">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-600 mt-0.5 truncate w-full uppercase tracking-wider">Free Plan</span>
            </div>
          </Link>

          <div className="space-y-1 mt-2">
            <Link 
              href="/dashboard/profile"
              className={cn(
                "flex items-center rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-black/5 dark:hover:border-white/10",
                pathname === '/dashboard/profile' ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <User className="h-3.5 w-3.5 mr-3" />
              Profile
            </Link>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Link 
                href="/dashboard/settings"
                className="flex items-center justify-center rounded-xl py-2 text-slate-500 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-black/5 dark:hover:border-white/10 text-[10px] font-black uppercase tracking-widest"
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center rounded-xl py-2 text-slate-500 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-500/5 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10 text-[10px] font-black uppercase tracking-widest" title="Logout"
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
