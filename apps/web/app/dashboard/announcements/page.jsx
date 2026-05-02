"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Megaphone, Plus, Pin, MessageSquare, Smile, Clock, User } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import useAuthStore from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import CreateAnnouncementModal from '@/components/CreateAnnouncementModal';
import MentionInput from '@/components/MentionInput';

export default function AnnouncementsPage() {
  const { currentWorkspace, announcements, fetchAnnouncements, isFetchingAnnouncements, addReaction, addComment, can } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchAnnouncements(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const filteredAnnouncements = announcements.filter(ann => {
    if (activeTab === 'pinned') return ann.isPinned;
    return true;
  });

  const handleReaction = async (announcementId, emoji) => {
    try {
      await addReaction(announcementId, emoji);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e, announcementId) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      await addComment(announcementId, commentText);
      setCommentText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center">
            <Megaphone className="mr-3 h-8 w-8 text-primary" />
            Announcements
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Broadcast updates and stay synchronized with your crew.</p>
        </div>
        {can('CREATE_ANNOUNCEMENT') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            New Announcement
          </button>
        )}
      </div>

      <div className="flex space-x-2 mb-8 p-1.5 bg-muted/30 w-fit rounded-2xl border border-border">
        {['all', 'pinned'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {isFetchingAnnouncements ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Receiving Broadcasts...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="rounded-[2.5rem] border border-dashed border-border bg-muted/10 p-20 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold">Silence in the hub</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">No announcements have been broadcasted yet. Start the conversation!</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="group relative bg-card border border-border rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden">
              {ann.isPinned && (
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Pin className="h-3 w-3" />
                    <span>Pinned</span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border shadow-sm">
                  {ann.author?.avatar ? (
                    <img src={ann.author.avatar} alt={ann.author.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-muted-foreground">{ann.author?.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-foreground">{ann.author?.name}</h3>
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">•</span>
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-foreground leading-relaxed prose prose-invert max-w-none font-medium">
                    {ann.content}
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        <button 
                          onClick={() => handleReaction(ann.id, '👍')}
                          className="flex items-center rounded-full bg-muted border border-border px-4 py-2 text-xs font-black hover:bg-foreground hover:text-background transition-all shadow-sm"
                        >
                          👍 <span className="ml-1.5 opacity-60">{ann.reactions?.filter(r => r.emoji === '👍').length || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleReaction(ann.id, '🚀')}
                          className="flex items-center rounded-full bg-muted border border-border px-4 py-2 text-xs font-black hover:bg-foreground hover:text-background transition-all shadow-sm"
                        >
                          🚀 <span className="ml-1.5 opacity-60">{ann.reactions?.filter(r => r.emoji === '🚀').length || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleReaction(ann.id, '❤️')}
                          className="flex items-center rounded-full bg-muted border border-border px-4 py-2 text-xs font-black hover:bg-foreground hover:text-background transition-all shadow-sm"
                        >
                          ❤️ <span className="ml-1.5 opacity-60">{ann.reactions?.filter(r => r.emoji === '❤️').length || 0}</span>
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === ann.id ? null : ann.id)}
                      className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {ann.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentId === ann.id && (
                    <div className="mt-6 border-t border-border pt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4 mb-6">
                        {ann.comments?.length === 0 ? (
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic text-center py-4 bg-muted/30 rounded-2xl">No comments yet. Be the first to reply!</p>
                        ) : (
                          ann.comments?.map(comment => (
                            <div key={comment.id} className="flex space-x-3 bg-muted/50 p-5 rounded-[1.5rem] border border-border shadow-sm">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shadow-inner">
                                {comment.user?.avatar ? (
                                  <img src={comment.user.avatar} alt={comment.user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xs font-black text-muted-foreground">{comment.user?.name?.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-baseline space-x-2">
                                  <span className="font-black text-sm text-foreground">{comment.user?.name}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 font-medium">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <form onSubmit={(e) => handleCommentSubmit(e, ann.id)} className="flex items-center space-x-3">
                        <MentionInput
                          placeholder={isCommenting ? "Sending..." : "Write a reply..."}
                          value={commentText}
                          onChange={setCommentText}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && commentText.trim() && !isCommenting) {
                              handleCommentSubmit(e, ann.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <button 
                          type="submit"
                          disabled={!commentText.trim() || isCommenting}
                          className="rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 shadow-md"
                        >
                          {isCommenting ? '...' : 'Reply'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
