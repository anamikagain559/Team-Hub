"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Swal from 'sweetalert2';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (user && currentWorkspace) {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://api-production-4940.up.railway.app', {
        query: {
          userId: user.id,
          workspaceId: currentWorkspace.id
        }
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.io');
      });

      // Real-time Updates
      socketInstance.on('new_announcement', (announcement) => {
        useWorkspaceStore.setState((state) => {
          const exists = state.announcements.some((ann) => ann.id === announcement.id);
          if (exists) return state;
          return {
            announcements: [announcement, ...state.announcements]
          };
        });
      });

      socketInstance.on('new_reaction', ({ announcementId, reaction }) => {
        useWorkspaceStore.setState((state) => ({
          announcements: state.announcements.map((ann) => {
            if (ann.id !== announcementId) return ann;
            const reactions = ann.reactions || [];
            const reactionExists = reactions.some((r) => r.id === reaction.id);
            if (reactionExists) return ann;
            return { ...ann, reactions: [...reactions, reaction] };
          })
        }));
      });

      socketInstance.on('remove_reaction', ({ announcementId, reactionId }) => {
        useWorkspaceStore.setState((state) => ({
          announcements: state.announcements.map((ann) => {
            if (ann.id !== announcementId) return ann;
            return { 
              ...ann, 
              reactions: (ann.reactions || []).filter((r) => r.id !== reactionId) 
            };
          })
        }));
      });

      socketInstance.on('new_comment', ({ announcementId, comment }) => {
        useWorkspaceStore.setState((state) => ({
          announcements: state.announcements.map((ann) => {
            if (ann.id !== announcementId) return ann;
            const commentExists = ann.comments?.some((c) => c.id === comment.id);
            if (commentExists) return ann;
            return { ...ann, comments: [...(ann.comments || []), comment] };
          })
        }));
      });

      socketInstance.on('goal_status_updated', ({ goalId, status }) => {
        useWorkspaceStore.setState((state) => ({
          goals: state.goals.map((g) => g.id === goalId ? { ...g, status } : g)
        }));
      });

      // Online Status
      socketInstance.on('user_online', ({ userId }) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socketInstance.on('user_offline', ({ userId }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      // Notifications
      socketInstance.on('new_notification', (notification) => {
        // Add to store
        useAuthStore.getState().addNotification(notification);
        
        // Show toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: notification.content,
          showConfirmButton: false,
          timer: 5000,
          background: '#0f172a',
          color: '#fff',
        });
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user?.id, currentWorkspace?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
