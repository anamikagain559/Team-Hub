"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Trash2, 
  Save, 
  AlertTriangle,
  Layout,
  Palette,
  Info
} from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { currentWorkspace, updateWorkspace, deleteWorkspace, can } = useWorkspaceStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accentColor: '#3b82f6'
  });

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name,
        description: currentWorkspace.description || '',
        accentColor: currentWorkspace.accentColor || '#3b82f6'
      });
    }
  }, [currentWorkspace]);

  if (!can('UPDATE_WORKSPACE_SETTINGS')) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to manage this workspace's settings. Please contact your administrator.
        </p>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateWorkspace(currentWorkspace.id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Settings Updated',
        text: 'Your workspace settings have been saved.',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: 'var(--workspace-color)'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message,
        background: '#0f172a',
        color: '#fff'
      });
    }
  };

  const handleDelete = async () => {
    const { value: confirmName } = await Swal.fire({
      title: 'Delete Workspace?',
      text: `This action is IRREVERSIBLE. All data, goals, and tasks will be lost forever. Type "${currentWorkspace.name}" to confirm:`,
      input: 'text',
      inputPlaceholder: currentWorkspace.name,
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Permanently Delete'
    });

    if (confirmName === currentWorkspace.name) {
      setIsDeleting(true);
      try {
        await deleteWorkspace(currentWorkspace.id);
        await Swal.fire({
          icon: 'success',
          title: 'Workspace Deleted',
          background: '#0f172a',
          color: '#fff'
        });
        window.location.href = '/workspaces';
      } catch (error) {
        setIsDeleting(false);
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.message,
          background: '#0f172a',
          color: '#fff'
        });
      }
    } else if (confirmName !== undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Incorrect Name',
        text: 'The workspace name did not match. Deletion cancelled.',
        background: '#0f172a',
        color: '#fff'
      });
    }
  };

  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center space-x-4 mb-12">
        <div 
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20"
          style={{ backgroundColor: 'var(--workspace-color)' }}
        >
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Workspace Settings</h1>
          <p className="text-muted-foreground font-medium">Manage your workspace identity and preferences</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* General Settings */}
        <section className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
          
          <div className="flex items-center space-x-3 mb-8">
            <Layout className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-tight">General Info</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. Creative Studio"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
                placeholder="What is this workspace about?"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* Visual Identity */}
        <section className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Visual Identity</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Accent Color</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({...formData, accentColor: color})}
                    className={cn(
                      "h-10 w-full rounded-xl transition-all duration-300 hover:scale-110",
                      formData.accentColor === color ? "ring-4 ring-primary/30 scale-110" : ""
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-muted/30 border border-border flex items-center space-x-4">
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-xl"
                style={{ backgroundColor: formData.accentColor }}
              >
                {formData.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight">Preview</p>
                <p className="text-xs text-muted-foreground">This is how your workspace will look</p>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-red-500">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-md">
              <p className="font-bold text-foreground mb-1">Delete this workspace</p>
              <p className="text-sm text-muted-foreground">Once deleted, you cannot recover any data. Please be certain.</p>
            </div>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Workspace'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
