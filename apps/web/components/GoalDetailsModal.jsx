"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, Target, Calendar, CheckCircle2, 
  Plus, Trash2, Clock, MessageSquare, TrendingUp 
} from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { cn } from '../lib/utils';
import Swal from 'sweetalert2';

export default function GoalDetailsModal({ goalId, isOpen, onClose }) {
  const { 
    goals,
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    fetchGoalActivity,
    updateGoalStatus 
  } = useWorkspaceStore();
  
  const goal = goals.find(g => g.id === goalId);
  
  const [activities, setActivities] = useState([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);
  const [isFetchingActivity, setIsFetchingActivity] = useState(false);

  useEffect(() => {
    if (isOpen && goalId) {
      loadActivity();
    }
  }, [isOpen, goalId]);

  const loadActivity = async () => {
    setIsFetchingActivity(true);
    const data = await fetchGoalActivity(goalId);
    setActivities(data);
    setIsFetchingActivity(false);
  };

  if (!isOpen || !goal) return null;

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setIsSubmittingMilestone(true);
    try {
      await addMilestone(goal.id, { title: newMilestoneTitle, progress: 0 });
      setNewMilestoneTitle('');
      loadActivity();
    } catch (error) {
      console.error('Failed to add milestone:', error);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  // Add a ref to store the timeout ID
  const debounceTimerRef = React.useRef(null);

  const handleUpdateMilestoneProgress = (milestoneId, newProgress) => {
    const updatedProgress = parseInt(newProgress);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateMilestone(goal.id, milestoneId, { progress: updatedProgress });
        loadActivity();

        const otherMilestones = goal.milestones.filter(m => m.id !== milestoneId);
        const totalProgress = Math.round(
          (otherMilestones.reduce((acc, m) => acc + m.progress, 0) + updatedProgress) / 
          goal.milestones.length
        );

        if (totalProgress === 100 && goal.status !== 'COMPLETED') {
          handleStatusToggle();
        }
      } catch (error) {
        console.error('Failed to update milestone:', error);
      }
    }, 500); // 500ms delay
  };

  const milestoneColors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-yellow-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-red-500',
    'from-indigo-500 to-violet-500',
  ];

  const getActivityIcon = (content) => {
    if (content.includes('created')) return '🌱';
    if (content.includes('milestone added')) return '✨';
    if (content.includes('updated to 100%')) return '🎯';
    if (content.includes('updated')) return '📈';
    if (content.includes('status updated')) return '🔄';
    if (content.includes('deleted')) return '🗑️';
    return '🕒';
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await deleteMilestone(goal.id, milestoneId);
      loadActivity();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const handleStatusToggle = async () => {
    const isCompleting = goal.status !== 'COMPLETED';
    const newStatus = isCompleting ? 'COMPLETED' : 'IN_PROGRESS';
    
    try {
      await updateGoalStatus(goal.id, newStatus);
      
      if (isCompleting) {
        onClose();
        Swal.fire({
          icon: 'success',
          title: 'Mission Accomplished!',
          text: `Goal "${goal.title}" has been marked as complete.`,
          background: '#0f172a',
          color: '#fff',
          confirmButtonColor: '#3b82f6',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-[2rem] border border-white/10 shadow-2xl'
          }
        });
      }
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const calculateTotalProgress = () => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const total = goal.milestones.reduce((acc, m) => acc + m.progress, 0);
    return Math.round(total / goal.milestones.length);
  };

  const totalProgress = calculateTotalProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{goal.title}</h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Due {new Date(goal.dueDate).toLocaleDateString()}
                </span>
                <span className={cn(
                  "flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                  goal.status === 'COMPLETED' ? "border-green-500/20 text-green-400 bg-green-500/10" : "border-blue-500/20 text-blue-400 bg-blue-500/10"
                )}>
                  {goal.status}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
          {/* Left Column: Milestones */}
          <div className="flex-[1.2] space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Milestones
                </h3>
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {totalProgress}% Complete
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-white/5 mb-6 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${totalProgress}%` }} 
                />
              </div>

              <div className="space-y-3">
                {goal.milestones?.map((milestone, index) => {
                  const colorClass = milestoneColors[index % milestoneColors.length];
                  return (
                    <div 
                      key={milestone.id}
                      className="group flex flex-col space-y-3 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            milestone.progress === 100 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : `bg-gradient-to-tr ${colorClass}`
                          )} />
                          <span className={cn(
                            "text-sm font-bold transition-all",
                            milestone.progress === 100 ? "text-slate-500 line-through decoration-slate-700" : "text-white"
                          )}>
                            {milestone.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-md",
                            milestone.progress === 100 ? "bg-green-500/10 text-green-500" : "bg-white/5 text-slate-400"
                          )}>
                            {milestone.progress}%
                          </span>
                          <button 
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="relative pt-2 pb-1">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 rounded-full bg-white/5" />
                        <div 
                          className={cn("absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full pointer-events-none bg-gradient-to-r transition-all duration-300", colorClass)}
                          style={{ width: `${milestone.progress}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={milestone.progress}
                          onChange={(e) => handleUpdateMilestoneProgress(milestone.id, e.target.value)}
                          className={cn(
                            "relative z-10 w-full h-1.5 appearance-none cursor-pointer bg-transparent transition-all",
                            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}

                <form onSubmit={handleAddMilestone} className="relative mt-4">
                  <input
                    type="text"
                    placeholder="Add a new milestone..."
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-0 transition-all"
                  />
                  <button 
                    disabled={isSubmittingMilestone || !newMilestoneTitle.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSubmittingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                  </button>
                </form>
              </div>
            </section>

            <section className="rounded-3xl bg-white/5 border border-white/5 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {goal.description || "No description provided for this goal."}
              </p>
            </section>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
              Activity Feed
            </h3>

            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {isFetchingActivity ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="relative pl-10 group/activity">
                    <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-lg group-hover/activity:border-primary/50 transition-colors">
                      <span className="text-xs">{getActivityIcon(activity.content)}</span>
                    </div>
                    <div className="bg-white/[0.02] rounded-2xl p-3 border border-transparent group-hover/activity:border-white/5 group-hover/activity:bg-white/[0.04] transition-all">
                      <p className="text-sm text-slate-300 leading-snug">{activity.content}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase mt-1.5 tracking-wider">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-white/5 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
              {goal.owner?.name?.charAt(0)}
            </div>
            <span className="text-xs font-medium text-slate-400">Assigned to {goal.owner?.name}</span>
          </div>
          <button 
            onClick={handleStatusToggle}
            className={cn(
              "flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              goal.status === 'COMPLETED' 
                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {goal.status === 'COMPLETED' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Active
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
