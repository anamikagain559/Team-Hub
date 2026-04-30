"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Target, Megaphone, CheckSquare, BarChart3, Settings } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { name: 'Go to Goals', icon: Target, href: '/goals' },
    { name: 'Go to Announcements', icon: Megaphone, href: '/announcements' },
    { name: 'Go to Action Items', icon: CheckSquare, href: '/tasks' },
    { name: 'Go to Analytics', icon: BarChart3, href: '/analytics' },
    { name: 'Workspace Settings', icon: Settings, href: '/settings' },
  ];

  const handleAction = (href) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="h-5 w-5 text-gray-500" />
          <input
            autoFocus
            className="flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-gray-500"
            placeholder="Type a command or search..."
          />
          <kbd className="hidden rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-500 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleAction(action.href)}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
            >
              <action.icon className="mr-4 h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
              <span className="flex-1 font-medium">{action.name}</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest group-hover:text-gray-400">Jump</span>
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center text-[10px] text-gray-500 space-x-4">
            <span className="flex items-center">
              <kbd className="mr-2 rounded bg-white/5 px-1.5 py-0.5">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center">
              <kbd className="mr-2 rounded bg-white/5 px-1.5 py-0.5">↵</kbd>
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
