"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Megaphone, Plus, Pin, MessageSquare, Smile, Clock, User } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import useAuthStore from '../../../store/useAuthStore';
import { cn } from '../../../lib/utils';
import CreateAnnouncementModal from '../../../components/CreateAnnouncementModal';
import MentionInput from '../../../components/MentionInput';

export default function AnnouncementsPage() {
  const { currentWorkspace, announcements, fetchAnnouncements, isFetchingAnnouncements, addReaction, addComment, can } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

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
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      await addComment(annId, commentText);
      setCommentText('');
      setActiveCommentId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Announcements</h1>
            <p className="mt-2 text-muted-foreground font-bold uppercase tracking-[0.1em] text-xs">Stay updated with the latest team news and updates.</p>
          </div>
          {can('CREATE_ANNOUNCEMENT') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20"
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
            <div className="rounded-[2.5rem] border border-dashed border-border p-16 text-center bg-card">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Megaphone className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-foreground">No announcements yet</h3>
              <p className="mt-2 text-muted-foreground font-medium">Important workspace updates will appear here.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div 
                key={ann.id}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem] border bg-card p-8 transition-all hover:border-primary/30 shadow-sm hover:shadow-2xl",
                  ann.isPinned ? "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.02]" : "border-border"
                )}
              >
                {ann.isPinned && (
                  <div className="absolute top-0 right-8 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-xl flex items-center shadow-lg">
                    <Pin className="mr-1.5 h-3 w-3 fill-current" />
                    Pinned
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shadow-inner">
                    {ann.author?.avatar ? (
                      <img src={ann.author.avatar} alt={ann.author.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-black text-muted-foreground">{ann.author?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">{ann.author?.name || 'Unknown User'}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-primary/60" />
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-black text-foreground tracking-tight">{ann.title}</h3>
                <div className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {ann.content}
                </div>

                {/* Reactions and Comments Toggle */}
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
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
