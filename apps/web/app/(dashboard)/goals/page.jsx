"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Target, Plus, ChevronRight, Clock, CheckCircle2, TrendingUp, MoreVertical, Trash2 } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import { cn } from '../../../lib/utils';
import CreateGoalModal from '../../../components/CreateGoalModal';
import GoalDetailsModal from '../../../components/GoalDetailsModal';
import Swal from 'sweetalert2';

export default function GoalsPage() {
  const { currentWorkspace, goals, fetchGoals, updateGoalStatus, deleteGoal, isLoading } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentWorkspace) {
      fetchGoals(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  if (!mounted) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const total = goal.milestones.reduce((acc, m) => acc + m.progress, 0);
    return Math.round(total / goal.milestones.length);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteGoal = async (e, goalId) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! All milestones and activity will be lost.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteGoal(goalId);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your goal has been deleted.',
          icon: 'success',
          background: '#0f172a',
          color: '#fff',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Failed to delete goal:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete goal.',
          background: '#0f172a',
          color: '#fff'
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="mt-1 text-gray-400">Track and manage your team's objectives</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && goals.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center animate-in fade-in duration-500">
            <Target className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
            <p className="mt-2 text-gray-400">Start by creating a goal for your workspace</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal);
            return (
              <div 
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-primary/40 hover:bg-white/10 cursor-pointer animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center space-x-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{goal.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                        Due {new Date(goal.dueDate).toLocaleDateString()}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                        getStatusColor(goal.status)
                      )}>
                        {goal.status.replace('_', ' ')}
                      </span>
                      {goal.milestones?.length > 0 && (
                        <span className="flex items-center text-slate-500">
                          <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                          {goal.milestones.length} Milestones
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="w-40">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>PROGRESS</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center -space-x-2">
                    <div 
                      title={`Assigned to ${goal.owner?.name}`}
                      className="h-9 w-9 rounded-full border-2 border-[#0a0a0a] bg-slate-800 flex items-center justify-center text-[10px] font-bold ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                    >
                      {goal.owner?.avatar ? (
                        <img src={goal.owner.avatar} alt={goal.owner.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        goal.owner?.name?.charAt(0)
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGoalStatus(goal.id, goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED');
                      }}
                      className={cn(
                        "rounded-xl p-2.5 transition-all",
                        goal.status === 'COMPLETED' ? "text-green-500 bg-green-500/10" : "text-gray-500 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteGoal(e, goal.id)}
                      className="rounded-xl p-2.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
      />

      {selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
