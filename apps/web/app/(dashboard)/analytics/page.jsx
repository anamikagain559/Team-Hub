"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
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
import useWorkspaceStore from '../../../store/useWorkspaceStore';

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
  const { currentWorkspace } = useWorkspaceStore();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-gray-400">View performance and export workspace data</p>
        </div>
        <button className="flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("h-6 w-6", stat.color)} />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Growth</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-400">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-6">Goal Completion Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    border: '1px solid #262626',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#3b82f6' : '#3b82f680'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-white font-medium">New goal created: "Q2 Roadmap"</p>
                  <p className="mt-1 text-xs text-gray-500">2 hours ago by Sarah</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Utility to handle class names since I used it above
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
