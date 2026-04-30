"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Megaphone, Plus, Pin, MessageSquare, Smile, Heart, ThumbsUp } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import useAuthStore from '../../../store/useAuthStore';
import axios from 'axios';
import { cn } from '../../../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AnnouncementsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { accessToken } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnnouncements = async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/announcements/${currentWorkspace.id}`, {
        headers: { Authorization: accessToken }
      });
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentWorkspace]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="mt-1 text-gray-400">Stay updated with team news and updates</p>
        </div>
        <button className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </button>
      </div>

      <div className="mt-8 space-y-6 max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No announcements yet</h3>
            <p className="mt-2 text-gray-400">Important updates will appear here</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div 
              key={ann.id}
              className={cn(
                "group relative rounded-2xl border bg-white/5 p-6 transition-all",
                ann.isPinned ? "border-primary/30 ring-1 ring-primary/20" : "border-white/10"
              )}
            >
              {ann.isPinned && (
                <div className="absolute top-4 right-6 flex items-center text-[10px] font-bold text-primary uppercase tracking-widest">
                  <Pin className="mr-1 h-3 w-3" />
                  Pinned
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white">{ann.title}</h3>
              <div className="mt-2 text-sm text-gray-400 leading-relaxed">
                {ann.content}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-1">
                    {/* Reactions summary */}
                    <div className="flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-1 text-xs">
                      <Smile className="mr-1 h-3 w-3 text-yellow-500" />
                      <span className="text-gray-400">{ann.reactions?.length || 0}</span>
                    </div>
                  </div>
                  <button className="flex items-center text-xs text-gray-500 hover:text-white transition-colors">
                    <MessageSquare className="mr-1.5 h-4 w-4" />
                    {ann.comments?.length || 0} Comments
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="rounded-lg p-2 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
