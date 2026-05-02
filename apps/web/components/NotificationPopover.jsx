"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function NotificationPopover() {
  const { notifications, fetchNotifications, markNotificationAsRead } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    
    // Close on click outside
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'MENTION': return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'TASK_ASSIGNED': return <Check className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative notification-container">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-[#0a0a0a]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c0c0c] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-primary">{unreadCount} New</span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inbox Zero</p>
                <p className="text-[11px] text-slate-600 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => !n.isRead && markNotificationAsRead(n.id)}
                    className={cn(
                      "group relative flex items-start space-x-3 p-4 hover:bg-white/5 cursor-pointer transition-colors",
                      !n.isRead && "bg-primary/[0.03]"
                    )}
                  >
                    <div className="mt-1 h-8 w-8 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs leading-relaxed",
                        n.isRead ? "text-slate-400" : "text-white font-bold"
                      )}>
                        {n.content}
                      </p>
                      <div className="mt-2 flex items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-white/5 p-3 text-center">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
