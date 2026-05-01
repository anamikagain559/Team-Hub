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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Action Items</h1>
          <p className="mt-1 text-slate-400 font-medium">Manage, track, and crush your team's tasks.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-xl bg-white/[0.03] p-1 border border-white/[0.05]">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
                viewMode === 'kanban' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Board
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
                viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <List className="mr-2 h-4 w-4" /> List
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            Add Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary"></div>
        </div>
      ) : (
        <div className="mt-8 animate-in fade-in duration-700">
          {viewMode === 'kanban' ? (
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {COLUMNS.map((col) => (
                <div 
                  key={col.id} 
                  className="flex min-w-[320px] flex-col rounded-[2rem] bg-white/[0.02] border border-white/[0.05] p-5"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="mb-5 flex items-center justify-between px-1">
                    <div className="flex items-center space-x-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]", col.color)} style={{ color: col.color.replace('bg-', '') }} />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
                        {col.name}
                      </h3>
                      <span className="flex h-5 items-center justify-center rounded-full bg-white/10 px-2 text-[10px] font-bold text-slate-400">
                        {tasks.filter((t) => t.status === col.id).length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 min-h-[150px]">
                    {tasks.filter((t) => t.status === col.id).map((task) => (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={cn(
                          "group relative rounded-2xl border border-white/5 bg-[#0c0c0c] p-4 transition-all hover:border-white/20 hover:bg-white/[0.02] cursor-grab active:cursor-grabbing shadow-lg",
                          draggingTaskId === task.id ? "opacity-50 scale-95" : ""
                        )}
                      >
                        {task.goal && (
                          <div className="mb-3 inline-flex items-center rounded-md bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border border-white/5">
                            <Target className="mr-1 h-3 w-3 text-primary" />
                            {task.goal.title}
                          </div>
                        )}
                        <h4 className="font-bold text-white leading-snug">{task.title}</h4>
                        
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300 ring-2 ring-[#0c0c0c]"
                              title={task.assignee?.name}
                            >
                              {task.assignee?.name?.charAt(0)}
                            </div>
                            {task.dueDate && (
                              <span className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {task.priority === 'URGENT' && (
                            <div className="flex h-5 items-center rounded-md bg-red-500/10 px-1.5 text-[10px] font-bold text-red-500 border border-red-500/20">
                              <AlertCircle className="mr-1 h-3 w-3" /> Urgent
                            </div>
                          )}
                          {task.priority === 'HIGH' && (
                            <div className="flex h-5 items-center rounded-md bg-orange-500/10 px-1.5 text-[10px] font-bold text-orange-500 border border-orange-500/20">
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
            <div className="rounded-[2rem] border border-white/10 bg-[#080808] overflow-hidden">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Task Title</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Assignee</th>
                    <th className="px-6 py-4 font-bold">Goal</th>
                    <th className="px-6 py-4 font-bold">Due Date</th>
                    <th className="px-6 py-4 font-bold">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No tasks found. Create one!</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{task.title}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            task.status === 'TODO' && "bg-gray-500/10 text-gray-400 border border-gray-500/20",
                            task.status === 'IN_PROGRESS' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                            task.status === 'COMPLETED' && "bg-green-500/10 text-green-400 border border-green-500/20",
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300">
                              {task.assignee?.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-300">{task.assignee?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.goal ? (
                            <span className="inline-flex items-center text-xs font-medium text-slate-400">
                              <Target className="mr-1.5 h-3 w-3 text-primary" /> {task.goal.title}
                            </span>
                          ) : <span className="text-slate-600">-</span>}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                           {task.priority === 'URGENT' && <span className="text-red-500 font-bold text-xs uppercase tracking-wider flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Urgent</span>}
                           {task.priority === 'HIGH' && <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">High</span>}
                           {task.priority === 'MEDIUM' && <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Medium</span>}
                           {task.priority === 'LOW' && <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Low</span>}
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
