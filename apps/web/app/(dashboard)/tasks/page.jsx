"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { CheckSquare, Plus, MoreHorizontal, Calendar, AlertCircle } from 'lucide-react';
import useWorkspaceStore from '../../../store/useWorkspaceStore';
import useAuthStore from '../../../store/useAuthStore';
import axios from 'axios';
import { cn } from '../../../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const COLUMNS = [
  { id: 'TODO', name: 'To Do', color: 'bg-gray-500' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-blue-500' },
  { id: 'COMPLETED', name: 'Completed', color: 'bg-green-500' },
];

export default function TasksPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { accessToken } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tasks/${currentWorkspace.id}`, {
        headers: { Authorization: accessToken }
      });
      setTasks(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentWorkspace]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status }, {
        headers: { Authorization: accessToken }
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Action Items</h1>
          <p className="mt-1 text-gray-400">Manage and track your team's tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-all">
            List View
          </button>
          <button className="flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="mt-8 flex space-x-6 overflow-x-auto pb-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex min-w-[320px] flex-col rounded-2xl bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center space-x-3">
                <div className={cn("h-2 w-2 rounded-full", col.color)} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  {col.name}
                </h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-400">
                  {tasks.filter((t) => t.status === col.id).length}
                </span>
              </div>
              <button className="rounded-lg p-1 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              {tasks.filter((t) => t.status === col.id).map((task) => (
                <div 
                  key={task.id}
                  draggable
                  className="group relative rounded-xl border border-white/10 bg-[#0d0d0d] p-4 transition-all hover:border-primary/50 hover:bg-white/5 cursor-grab active:cursor-grabbing"
                >
                  <h4 className="font-medium text-white line-clamp-2">{task.title}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300">
                        {task.assignee?.name?.charAt(0)}
                      </div>
                      <span className="flex items-center text-[10px] text-gray-500 font-medium">
                        <Calendar className="mr-1 h-3 w-3" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    {task.priority === 'URGENT' && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
              
              <button className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/10 py-3 text-sm text-gray-500 hover:border-white/20 hover:bg-white/5 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
