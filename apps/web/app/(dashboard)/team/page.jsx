'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, UserPlus, Shield, Mail, Loader2, MoreVertical } from 'lucide-react';
import useWorkspaceStore from '@/store/useWorkspaceStore';
import InviteMemberModal from '@/components/InviteMemberModal';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export default function TeamPage() {
  const { currentWorkspace, fetchWorkspaceMembers } = useWorkspaceStore();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const highlightUserId = searchParams.get('highlight');

  const loadMembers = async () => {
    if (currentWorkspace) {
      setIsLoading(true);
      const data = await fetchWorkspaceMembers(currentWorkspace.id);
      setMembers(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentWorkspace]);

  return (
    <DashboardLayout>
      <React.Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Team Members</h1>
              <p className="mt-1 text-slate-400">Manage who has access to the {currentWorkspace?.name} workspace</p>
            </div>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {members.map((member) => (
                      <tr 
                        key={member.id} 
                        className={cn(
                          "group hover:bg-white/5 transition-colors",
                          highlightUserId === member.user.id ? "bg-blue-600/10 ring-1 ring-inset ring-blue-600/30" : ""
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                              {member.user.avatar ? (
                                <img src={member.user.avatar} alt={member.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <Users className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{member.user.name}</div>
                              <div className="text-xs text-slate-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {member.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                            member.role === 'ADMIN' 
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            <Shield className="mr-1 h-3 w-3" />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {members.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-4 text-lg font-medium text-white">No members yet</h3>
                  <p className="mt-2 text-slate-400">Invite someone to start collaborating in this workspace</p>
                </div>
              )}
            </div>
          )}

          {currentWorkspace && (
            <InviteMemberModal 
              isOpen={isInviteModalOpen} 
              onClose={() => setIsInviteModalOpen(false)}
              workspaceId={currentWorkspace.id}
              onInviteSuccess={loadMembers}
            />
          )}
        </div>
      </React.Suspense>
    </DashboardLayout>
  );
}
