"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Megaphone, Plus, Pin, MessageSquare, Smile, Clock, User } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import useAuthStore from '../../../store/useAuthStore';
import { cn } from '../../../lib/utils';
import CreateAnnouncementModal from '../../../components/CreateAnnouncementModal';

export default function AnnouncementsPage() {
  const { currentWorkspace, announcements, fetchAnnouncements, isFetchingAnnouncements, addReaction, addComment } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const isWorkspaceAdmin = currentWorkspace?.members?.some(m => 
    (m.userId === user?.id || m.user?.id === user?.id) && m.role === 'ADMIN'
  );

  // If user is not loaded yet, we can optionally show it or hide it.
  // We'll show it if they are an admin OR if we haven't loaded the user yet.
  const canPublish = isWorkspaceAdmin || user?.role === 'ADMIN' || !currentWorkspace?.members;

  useEffect(() => {
    if (currentWorkspace) {
      fetchAnnouncements(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const handleReaction = async (annId, emoji) => {
    try {
      await addReaction(annId, emoji);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e, annId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(annId, commentText);
      setCommentText('');
      setActiveCommentId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Announcements</h1>
            <p className="mt-2 text-slate-400">Stay updated with the latest team news and updates.</p>
          </div>
          {canPublish && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
              Publish
            </button>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {isFetchingAnnouncements && announcements.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center bg-white/[0.02]">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Megaphone className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No announcements yet</h3>
              <p className="mt-2 text-slate-400">Important workspace updates will appear here.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div 
                key={ann.id}
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] border bg-[#0c0c0c] p-8 transition-all hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
                  ann.isPinned ? "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.02]" : "border-white/[0.08]"
                )}
              >
                {ann.isPinned && (
                  <div className="absolute top-0 right-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-xl flex items-center shadow-lg">
                    <Pin className="mr-1.5 h-3 w-3 fill-current" />
                    Pinned
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-800 border border-white/10 flex items-center justify-center">
                    {ann.author?.avatar ? (
                      <img src={ann.author.avatar} alt={ann.author.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-400">{ann.author?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{ann.author?.name || 'Unknown User'}</h4>
                    <span className="text-xs font-medium text-slate-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">{ann.title}</h3>
                <div className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </div>

                {/* Reactions and Comments Toggle */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex items-center space-x-3">
                    {/* Unique Reactions Count (Simple display for now) */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleReaction(ann.id, '👍')}
                        className="flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
                      >
                        👍 <span className="ml-1.5 text-slate-400">{ann.reactions?.filter(r => r.emoji === '👍').length || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleReaction(ann.id, '🚀')}
                        className="flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
                      >
                        🚀 <span className="ml-1.5 text-slate-400">{ann.reactions?.filter(r => r.emoji === '🚀').length || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleReaction(ann.id, '❤️')}
                        className="flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
                      >
                        ❤️ <span className="ml-1.5 text-slate-400">{ann.reactions?.filter(r => r.emoji === '❤️').length || 0}</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === ann.id ? null : ann.id)}
                    className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {ann.comments?.length || 0} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentId === ann.id && (
                  <div className="mt-6 border-t border-white/5 pt-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 mb-6">
                      {ann.comments?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-2">No comments yet. Be the first to reply!</p>
                      ) : (
                        ann.comments?.map(comment => (
                          <div key={comment.id} className="flex space-x-3 bg-white/[0.02] p-4 rounded-2xl">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                              {comment.user?.avatar ? (
                                <img src={comment.user.avatar} alt={comment.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-slate-400">{comment.user?.name?.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <span className="font-bold text-sm text-white">{comment.user?.name}</span>
                                <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <form onSubmit={(e) => handleCommentSubmit(e, ann.id)} className="flex items-center space-x-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="You" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                      <button 
                        type="submit"
                        disabled={!commentText.trim()}
                        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}
