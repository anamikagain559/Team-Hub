"use client";
import React, { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

const data = [
  { name: 'Week 1', completed: 4 },
  { name: 'Week 2', completed: 7 },
  { name: 'Week 3', completed: 5 },
  { name: 'Week 4', completed: 12 },
];

const stats = [
  { name: 'Total Goals', value: '12', icon: TrendingUp, color: 'text-blue-500' },
  { name: 'Completed This Week', value: '8', icon: CheckCircle, color: 'text-green-500' },
  { name: 'Overdue Count', value: '3', icon: AlertCircle, color: 'text-red-500' },
  { name: 'In Progress', value: '15', icon: Clock, color: 'text-yellow-500' },
];

export default function AnalyticsPage() {
  const { currentWorkspace, fetchDashboardStats, fetchWorkspaceExportData } = useWorkspaceStore();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentWorkspace) return;
      setIsLoading(true);
      const result = await fetchDashboardStats(currentWorkspace.id);
      if (result) {
        setStats([
          { name: 'Total Goals', value: result.totalGoals, icon: TrendingUp, color: 'text-blue-500' },
          { name: 'Weekly Completions', value: result.itemsCompletedThisWeek, icon: CheckCircle, color: 'text-green-500' },
          { name: 'Overdue Items', value: result.overdueCount, icon: AlertCircle, color: 'text-red-500' },
          { name: 'Active Workspace', value: 'Live', icon: Clock, color: 'text-yellow-500' },
        ]);
        setData(result.chartData || []);
      }
      setIsLoading(false);
    };

    loadStats();
  }, [currentWorkspace]);

  const handleExportCSV = async () => {
    if (!currentWorkspace) return;
    try {
      const result = await fetchWorkspaceExportData(currentWorkspace.id);
      
      const rows = [];
      
      // Headers & Goals
      rows.push(["--- GOALS ---"]);
      rows.push(["Title", "Status", "Owner", "Due Date", "Created At"]);
      result.goals.forEach(g => {
        rows.push([
          g.title,
          g.status,
          g.owner?.name || 'N/A',
          g.dueDate ? new Date(g.dueDate).toLocaleDateString() : 'N/A',
          new Date(g.createdAt).toLocaleDateString()
        ]);
      });

      rows.push([]); // Spacer
      
      // Headers & Action Items
      rows.push(["--- ACTION ITEMS ---"]);
      rows.push(["Title", "Status", "Priority", "Assignee", "Goal", "Due Date"]);
      result.actionItems.forEach(t => {
        rows.push([
          t.title,
          t.status,
          t.priority,
          t.assignee?.name || 'N/A',
          t.goal?.title || 'None',
          t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
        ]);
      });

      // Convert to CSV string with quoting
      const csvContent = rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${currentWorkspace.name.replace(/\s+/g, '_')}_Analytics_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire({
        title: 'Permission Denied',
        text: 'Only Workspace Administrators can export data. Please contact your admin for access.',
        icon: 'error',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-[2rem] border border-white/10'
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-gray-400">Real-time performance metrics for {currentWorkspace?.name}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-all border border-white/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("h-6 w-6", stat.color)} />
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest">Workspace Stat</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-400 font-medium">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-slate-400">Goal Completion Trend</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  stroke="#737373" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ dy: 10, fontWeight: 900 }}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tick={{ dx: -10, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#0c0c0c', 
                    border: '1px solid #ffffff10',
                    borderRadius: '20px',
                    padding: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                  labelStyle={{ color: '#737373', fontSize: '10px', marginBottom: '4px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#3b82f6' : '#3b82f640'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-slate-400">Live Insights</h3>
          <div className="space-y-8">
            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
              <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">Performance Tip</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                You've completed <span className="text-white font-bold">{stats.find(s => s.name === 'Weekly Completions')?.value || 0} items</span> this week. Keep maintaining this momentum to reach your Q2 goals!
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Workspace Health', value: 'Good', color: 'bg-green-500' },
                { label: 'Team Velocity', value: '+12%', color: 'bg-blue-500' },
                { label: 'Focus Score', value: '88/100', color: 'bg-purple-500' },
              ].map((insight) => (
                <div key={insight.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full", insight.color)} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{insight.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{insight.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


