"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { CheckSquare, Plus, MoreHorizontal, Calendar, AlertCircle, LayoutGrid, List, Target } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import CreateTaskModal from '../../../components/CreateTaskModal';
import { cn } from '../../../lib/utils';

const COLUMNS = [
  { id: 'TODO', name: 'To Do', color: 'bg-gray-500' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-blue-500' },
  { id: 'COMPLETED', name: 'Completed', color: 'bg-green-500' },
];

export default function TasksPage() {
  const { currentWorkspace, tasks, fetchTasks, updateTaskStatus } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  
  // Drag and Drop state
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  useEffect(() => {
    if (currentWorkspace) {
      setIsLoading(true);
      fetchTasks(currentWorkspace.id).finally(() => setIsLoading(false));
    }
  }, [currentWorkspace]);

  const handleDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && draggingTaskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        updateTaskStatus(taskId, status);
      }
    }
    setDraggingTaskId(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Action Items</h1>
          <p className="mt-1 text-muted-foreground font-bold uppercase tracking-[0.1em] text-xs">Manage, track, and crush your team's tasks.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-2xl bg-muted/50 p-1 border border-border">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "flex items-center rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'kanban' ? "bg-background text-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Board
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'list' ? "bg-background text-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="mr-2 h-4 w-4" /> List
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            Add Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        </div>
      ) : (
        <div className="mt-8 animate-in fade-in duration-700">
          {viewMode === 'kanban' ? (
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {COLUMNS.map((col) => (
                <div 
                  key={col.id} 
                  className="flex min-w-[320px] flex-col rounded-[2.5rem] bg-card border border-border p-6 shadow-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center space-x-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]", col.color)} style={{ color: col.color.replace('bg-', '') }} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {col.name}
                      </h3>
                      <span className="flex h-5 items-center justify-center rounded-full bg-muted px-2 text-[10px] font-black text-muted-foreground border border-border">
                        {tasks.filter((t) => t.status === col.id).length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 min-h-[150px]">
                    {tasks.filter((t) => t.status === col.id).map((task) => (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={cn(
                          "group relative rounded-3xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-xl cursor-grab active:cursor-grabbing",
                          draggingTaskId === task.id ? "opacity-50 scale-95" : ""
                        )}
                      >
                        {task.goal && (
                          <div className="mb-3 inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                            <Target className="mr-1 h-3 w-3" />
                            {task.goal.title}
                          </div>
                        )}
                        <h4 className="font-black text-foreground leading-snug text-base">{task.title}</h4>
                        
                        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-inner"
                              title={task.assignee?.name}
                            >
                              {task.assignee?.name?.charAt(0)}
                            </div>
                            {task.dueDate && (
                              <span className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                <Calendar className="mr-1.5 h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {task.priority === 'URGENT' && (
                            <div className="flex h-6 items-center rounded-lg bg-red-500/10 px-2 text-[9px] font-black uppercase tracking-widest text-red-600 border border-red-500/20 shadow-sm shadow-red-500/5">
                              <AlertCircle className="mr-1 h-3.5 w-3.5" /> Urgent
                            </div>
                          )}
                          {task.priority === 'HIGH' && (
                            <div className="flex h-6 items-center rounded-lg bg-orange-500/10 px-2 text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-500/20 shadow-sm shadow-orange-500/5">
                              High
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-8 py-5">Task Title</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Assignee</th>
                    <th className="px-8 py-5">Goal</th>
                    <th className="px-8 py-5">Due Date</th>
                    <th className="px-8 py-5">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-16 text-center text-muted-foreground font-medium bg-card/30">No tasks found. Create one!</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-8 py-5 font-black text-foreground text-base group-hover:text-primary transition-colors">{task.title}</td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            task.status === 'TODO' && "bg-muted text-muted-foreground border-border",
                            task.status === 'IN_PROGRESS' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                            task.status === 'COMPLETED' && "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-inner overflow-hidden">
                              {task.assignee?.avatar ? (
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="h-full w-full object-cover" />
                              ) : task.assignee?.name?.charAt(0)}
                            </div>
                            <span className="font-black text-xs text-foreground/80">{task.assignee?.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {task.goal ? (
                            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <Target className="mr-1.5 h-3.5 w-3.5 text-primary/60" /> {task.goal.title}
                            </span>
                          ) : <span className="text-muted-foreground/30">-</span>}
                        </td>
                        <td className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-8 py-5">
                           {task.priority === 'URGENT' && <span className="text-red-600 dark:text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20"><AlertCircle className="w-3.5 h-3.5 mr-1.5"/> Urgent</span>}
                           {task.priority === 'HIGH' && <span className="text-orange-600 dark:text-orange-500 font-black text-[10px] uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">High</span>}
                           {task.priority === 'MEDIUM' && <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">Medium</span>}
                           {task.priority === 'LOW' && <span className="text-muted-foreground font-black text-[10px] uppercase tracking-widest bg-muted px-2 py-1 rounded-lg border border-border">Low</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}
