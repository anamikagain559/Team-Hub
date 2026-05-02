"use client";
import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, MoreHorizontal, Calendar, AlertCircle, LayoutGrid, List, Target, Edit2, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import CreateTaskModal from '@/components/CreateTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

const COLUMNS = [
  { id: 'TODO', name: 'To Do', color: 'bg-slate-400', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]' },
  { id: 'IN_PROGRESS', name: 'Active', color: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
  { id: 'DONE', name: 'Completed', color: 'bg-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
];

export default function TasksPage() {
  const { currentWorkspace, tasks, fetchTasks, updateTaskStatus, deleteTask } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('board');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchTasks(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Status moved to ${newStatus.replace('_', ' ')}`,
        showConfirmButton: false,
        timer: 2000,
        background: '#0f172a',
        color: '#fff',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async (taskId) => {
    setActiveMenu(null);
    const result = await Swal.fire({
      title: 'Delete Action Item?',
      text: 'This will permanently remove this task.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
      background: '#0f172a',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Task deleted',
          showConfirmButton: false,
          timer: 2000,
          background: '#0f172a',
          color: '#fff',
        });
      } catch (e) {}
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            <CheckSquare className="mr-4 h-10 w-10 text-primary" />
            Action Items
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2">Manage and track your workspace tasks.</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-muted/20 p-1.5 rounded-2xl border border-border/50 backdrop-blur-sm">
            <button 
              onClick={() => setViewMode('board')}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest", 
                viewMode === 'board' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest", 
                viewMode === 'list' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center rounded-2xl bg-foreground text-background px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl hover:shadow-primary/10 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3px] group-hover:rotate-90 transition-transform" />
            New Task
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid md:grid-cols-3 gap-8 h-full min-h-[700px] items-start">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col bg-muted/5 rounded-[2.5rem] border border-border/40 p-6 min-h-[600px] relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8 px-2 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className={cn("h-3 w-3 rounded-full animate-pulse", column.color, column.glow)} />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground/70">{column.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] font-black bg-card border border-border/60 px-3 py-1.5 rounded-xl text-muted-foreground shadow-sm">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-5 relative z-10">
                {tasks.filter(t => t.status === column.id).map(task => (
                  <div 
                    key={task.id}
                    className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="absolute top-4 right-4 z-20">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === task.id ? null : task.id);
                          }}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === task.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => handleEdit(task)}
                              className="flex w-full items-center px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                              <Edit2 className="mr-3 h-3.5 w-3.5" />
                              Edit Item
                            </button>
                            <button 
                              onClick={() => handleDelete(task.id)}
                              className="flex w-full items-center px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                            >
                              <Trash2 className="mr-3 h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      {task.goalId && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary mb-3">
                          <Target className="h-3 w-3 mr-1.5" />
                          {task.goal?.title || 'Goal Link'}
                        </div>
                      )}
                      <h4 className="font-black text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{task.title}</h4>
                      <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/40">
                      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Calendar className="mr-2 h-3.5 w-3.5 text-primary/40" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                      </div>
                      
                      <div className="flex items-center -space-x-2">
                        <div title={task.assignee?.name} className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-black overflow-hidden shadow-sm">
                          {task.assignee?.avatar ? (
                            <img src={task.assignee.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground">{task.assignee?.name?.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Move Buttons */}
                    <div className="mt-4 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {column.id !== 'TODO' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, 'TODO')}
                          className="p-2 rounded-xl bg-muted/50 hover:bg-slate-400/10 text-slate-500 transition-all border border-transparent hover:border-slate-400/20"
                          title="Move to Todo"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {column.id !== 'IN_PROGRESS' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                          className="p-2 rounded-xl bg-muted/50 hover:bg-blue-500/10 text-blue-500 transition-all border border-transparent hover:bg-blue-500/20"
                          title="Move to Active"
                        >
                           {column.id === 'TODO' ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      {column.id !== 'DONE' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, 'DONE')}
                          className="p-2 rounded-xl bg-muted/50 hover:bg-green-500/10 text-green-500 transition-all border border-transparent hover:border-green-500/20"
                          title="Move to Done"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {tasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                    <CheckSquare className="h-10 w-10 mb-4 text-muted-foreground/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">No items</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Item</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assignee</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Due Date</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="bg-muted/50 border border-border/60 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer hover:bg-muted"
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id} className="bg-card">{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-black overflow-hidden shadow-sm">
                        {task.assignee?.avatar ? (
                          <img src={task.assignee.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground">{task.assignee?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-[12px] font-bold text-foreground/80">{task.assignee?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <button onClick={() => handleEdit(task)} className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"><Edit2 className="h-4 w-4" /></button>
                       <button onClick={() => handleDelete(task.id)} className="p-2 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="py-32 text-center">
              <CheckSquare className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-sm">Workspace Clear</p>
            </div>
          )}
        </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        workspaceId={currentWorkspace?.id}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
    </>
  );
}
