'use client';

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Camera, Mail, User, Shield, Check, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { user, fetchMe, updateProfile, isLoading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPreviewUrl(user.avatar || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name }, selectedFile);
      Swal.fire({
        title: 'Success!',
        text: 'Your profile has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user && isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt={name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition duration-200">
                <Camera className="text-white w-8 h-8" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Role: <span className="font-medium text-slate-900 dark:text-white uppercase">{user?.role}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Email cannot be changed</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
