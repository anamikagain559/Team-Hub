"use client";
import React, { useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Target, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import { cn } from '../../../lib/utils';

export default function GoalsPage() {
  const { currentWorkspace, goals, fetchGoals, updateGoalStatus, isLoading } = useWorkspaceStore();

  useEffect(() => {
    if (currentWorkspace) {
      fetchGoals(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="mt-1 text-gray-400">Track and manage your team's objectives</p>
        </div>
        <button className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all">
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
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
            <p className="mt-2 text-gray-400">Start by creating a goal for your workspace</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div 
              key={goal.id}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Due {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                      getStatusColor(goal.status)
                    )}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-gray-500">
                    <span>PROGRESS</span>
                    <span>75%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: '75%' }} />
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                    {goal.owner?.name?.charAt(0)}
                  </div>
                </div>

                <button 
                  onClick={() => updateGoalStatus(goal.id, goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                  className="rounded-lg p-2 text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                >
                  <CheckCircle2 className={cn(
                    "h-5 w-5",
                    goal.status === 'COMPLETED' ? "text-green-500" : ""
                  )} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
