'use client';

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Camera, Mail, User, Shield, Check, Loader2 } from 'lucide-react';
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
        confirmButtonColor: '#2563eb',
        background: '#0f172a',
        color: '#fff',
      });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Profile Settings</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your personal identity and workspace presence.</p>
        </div>

        {(!user && isLoading) ? (
           <div className="flex items-center justify-center min-h-[40vh]">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-600"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0c0c0c] rounded-[2rem] border border-white/10 p-8 flex flex-col items-center shadow-2xl">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl bg-white/5 flex items-center justify-center transition-all group-hover:border-primary/50">
                {previewUrl ? (
                  <img src={previewUrl} alt={name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <User className="w-20 h-20 text-slate-700" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm">
                <Camera className="text-white w-10 h-10" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h2 className="mt-6 text-2xl font-black text-white tracking-tight">{user?.name}</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
            
            <div className="mt-8 w-full pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <Shield className="w-4 h-4 text-primary" />
                <span>Status: <span className="text-white">{user?.role}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0c0c0c] rounded-[2rem] border border-white/10 p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200 font-bold"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-700" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full pl-12 pr-4 py-4 bg-white/[0.01] border border-white/5 rounded-2xl text-slate-600 cursor-not-allowed font-bold"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-1">Identity verification managed by TeamHub</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold animate-pulse">
                  {error}
                </div>
              )}

              <div className="pt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
