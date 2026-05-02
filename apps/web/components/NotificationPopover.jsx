"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function NotificationPopover() {
  const { notifications, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    if (isOpen) {
      markAllNotificationsAsRead();
    }
    
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
        className={cn(
          "relative p-2 rounded-xl transition-all",
          isOpen 
            ? "text-primary bg-primary/10 shadow-inner" 
            : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-white/5"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-white dark:ring-[#0a0a0a] animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-6 py-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="h-16 w-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 border border-slate-100 dark:border-white/10 shadow-inner">
                  <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Inbox Zero</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">You're all caught up! No new notifications at the moment.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => !n.isRead && markNotificationAsRead(n.id)}
                    className={cn(
                      "group relative flex items-start space-x-4 p-4 rounded-3xl border transition-all active:scale-[0.98] cursor-pointer",
                      !n.isRead 
                        ? "bg-primary/[0.04] dark:bg-primary/10 border-primary/20 dark:border-primary/30 shadow-sm shadow-primary/5" 
                        : "bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-200 dark:hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "mt-1 h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border shadow-sm transition-all group-hover:rotate-12",
                      !n.isRead 
                        ? "bg-white dark:bg-primary border-primary/20 dark:border-transparent text-primary dark:text-white" 
                        : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500"
                    )}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[14px] leading-relaxed",
                        n.isRead 
                          ? "text-slate-500 dark:text-white/60 font-medium" 
                          : "text-slate-950 dark:text-white font-black"
                      )}>
                        {n.content}
                      </p>
                      <div className="mt-3 flex items-center text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.1em]">
                        <Clock className="mr-2 h-3.5 w-3.5 text-slate-300 dark:text-white/20" />
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.8)] border-2 border-white dark:border-[#0c0c0c]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-5 text-center">
            <button 
              onClick={() => markAllNotificationsAsRead()}
              className="w-full py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
