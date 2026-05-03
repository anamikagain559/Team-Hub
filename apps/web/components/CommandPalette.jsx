import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Users, 
  Megaphone, 
  Plus, 
  Settings,
  Command,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useWorkspaceStore from '@/store/useWorkspaceStore';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', shortcut: 'D' },
    { id: 'tasks', name: 'Action Items', icon: CheckSquare, path: '/dashboard/tasks', shortcut: 'T' },
    { id: 'goals', name: 'Strategic Goals', icon: Target, path: '/dashboard/goals', shortcut: 'G' },
    { id: 'team', name: 'Team Hub', icon: Users, path: '/dashboard/team', shortcut: 'H' },
    { id: 'announcements', name: 'Announcements', icon: Megaphone, path: '/dashboard/announcements', shortcut: 'A' },
  ];

  const filteredItems = query === '' 
    ? navigationItems 
    : navigationItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        router.push(selected.path);
        setIsOpen(false);
      }
    }
  }, [isOpen, filteredItems, selectedIndex, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
        <div className="relative flex items-center p-6 border-b border-white/10">
          <Search className="h-6 w-6 text-slate-400 mr-4" />
          <input
            autoFocus
            className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 focus:outline-none"
            placeholder="Type to navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 ml-4">
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">ESC to close</span>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Quick Navigation</p>
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-200 group relative overflow-hidden",
                      isSelected 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.01]" 
                        : "text-slate-400 hover:bg-white/5"
                    )}
                    onClick={() => {
                      router.push(item.path);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center mr-4 transition-all",
                        isSelected ? "bg-white/20" : "bg-white/5"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {isSelected ? (
                        <ArrowRight className="h-4 w-4 animate-in slide-in-from-left-2 duration-300" />
                      ) : (
                        <div className="flex items-center space-x-1 opacity-40">
                          <Command className="h-3 w-3" />
                          <span className="text-[10px] font-bold">{item.shortcut}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-6 w-8 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black text-slate-400">↑↓</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">to navigate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-6 w-12 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black text-slate-400">ENTER</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">to open</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{currentWorkspace?.name}</p>
        </div>
      </div>
    </div>
  );
}
