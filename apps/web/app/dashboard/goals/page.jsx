"use client";
import React, { useEffect, useState } from 'react';
import { Target, Plus, Clock, CheckCircle2, TrendingUp, Trash2, Pencil } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import { cn } from '@/lib/utils';
import CreateGoalModal from '@/components/CreateGoalModal';
import GoalDetailsModal from '@/components/GoalDetailsModal';
import EditGoalModal from '@/components/EditGoalModal';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';

export default function GoalsPage() {
  const { currentWorkspace, goals, fetchGoals, updateGoalStatus, deleteGoal, isLoading, can } = useWorkspaceStore();
  const { resolvedTheme } = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentWorkspace?.id) {
      fetchGoals(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  if (!mounted) return null;

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      await updateGoalStatus(goalId, newStatus);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message,
        background: resolvedTheme === 'dark' ? '#0f172a' : '#fff',
        color: resolvedTheme === 'dark' ? '#fff' : '#0f172a',
      });
    }
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (e, goal) => {
    e.stopPropagation();
    setSelectedGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (e, goal) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${goal.title}". This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete it!',
      background: resolvedTheme === 'dark' ? '#0f172a' : '#fff',
      color: resolvedTheme === 'dark' ? '#fff' : '#0f172a',
    });

    if (result.isConfirmed) {
      try {
        await deleteGoal(goal.id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Goal has been removed.',
          background: resolvedTheme === 'dark' ? '#0f172a' : '#fff',
          color: resolvedTheme === 'dark' ? '#fff' : '#0f172a',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete goal.',
          background: resolvedTheme === 'dark' ? '#0f172a' : '#fff',
          color: resolvedTheme === 'dark' ? '#fff' : '#0f172a'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const totalProgress = goal.milestones.reduce((acc, m) => acc + (m.progress || 0), 0);
    return Math.round(totalProgress / goal.milestones.length);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Goals</h1>
          <p className="mt-1 text-muted-foreground font-bold uppercase tracking-[0.1em] text-xs">Track and manage your team's objectives</p>
        </div>
        {can('CREATE_GOAL') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            Create Goal
          </button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && goals.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-[2.5rem] border border-dashed border-border p-16 text-center animate-in fade-in duration-500 bg-card/30">
            <Target className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-6 text-2xl font-black text-foreground">No goals yet</h3>
            <p className="mt-2 text-muted-foreground font-medium">Start by creating a goal for your workspace</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal);
            return (
              <div
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="group flex flex-col md:flex-row md:items-center justify-between rounded-[2rem] border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-muted/50 cursor-pointer animate-in slide-in-from-bottom-2 duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center space-x-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <Target className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl group-hover:text-primary transition-colors text-foreground">{goal.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-primary/60" />
                        Due {new Date(goal.dueDate).toLocaleDateString()}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-lg border shadow-sm",
                        getStatusColor(goal.status)
                      )}>
                        {goal.status.replace('_', ' ')}
                      </span>
                      {goal.milestones?.length > 0 && (
                        <span className="flex items-center">
                          <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                          {goal.milestones.length} Milestones
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 mt-6 md:mt-0">
                  <div className="w-full md:w-48">
                    <div className="flex items-center justify-between mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <span>PROGRESS</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden ring-1 ring-border">
                      <div className="h-full rounded-full bg-primary transition-all duration-700 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center -space-x-3">
                    <div
                      title={`Assigned to ${goal.owner?.name}`}
                      className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-md overflow-hidden"
                    >
                      {goal.owner?.avatar ? (
                        <img src={goal.owner.avatar} alt={goal.owner.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground">{goal.owner?.name?.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {can('UPDATE_GOAL') && (
                      <button
                        onClick={(e) => handleEditClick(e, goal)}
                        className="rounded-xl p-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all md:opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoalClick(goal);
                      }}
                      className="flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary transition-all border border-border hover:border-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                      <span>Milestone</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(goal.id, goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED');
                      }}
                      className={cn(
                        "rounded-xl p-2.5 transition-all shadow-sm",
                        goal.status === 'COMPLETED' ? "text-green-500 bg-green-500/10 border border-green-500/20" : "text-muted-foreground bg-muted hover:bg-foreground hover:text-background border border-border"
                      )}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    {can('DELETE_GOAL') && (
                      <button
                        onClick={(e) => handleDeleteClick(e, goal)}
                        className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all md:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={currentWorkspace?.id}
      />

      <EditGoalModal
        goal={selectedGoal}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGoal(null);
        }}
      />

      {selectedGoal && (
        <GoalDetailsModal
          goalId={selectedGoal.id}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedGoal(null);
          }}
        />
      )}
    </>
  );
}
