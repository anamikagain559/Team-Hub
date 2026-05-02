import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

// Map to track online users: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

export const SocketHelper = {
  init: (server: HttpServer) => {
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      const workspaceId = socket.handshake.query.workspaceId as string;

      if (userId) {
        // Track online user
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)?.add(socket.id);
        
        // Join workspace room
        if (workspaceId) {
          socket.join(`workspace_${workspaceId}`);
          // Notify others in workspace that someone came online
          io.to(`workspace_${workspaceId}`).emit('user_online', { userId });
        }

        // Broadcast current online users in this workspace to the new user
        // Note: In a real app, you'd calculate this from the onlineUsers map and workspace members
      }

      socket.on('disconnect', () => {
        if (userId) {
          const userSockets = onlineUsers.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              onlineUsers.delete(userId);
              if (workspaceId) {
                io.to(`workspace_${workspaceId}`).emit('user_offline', { userId });
              }
            }
          }
        }
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  emitToWorkspace: (workspaceId: string, event: string, data: any) => {
    if (io) {
      io.to(`workspace_${workspaceId}`).emit(event, data);
    }
  },

  emitToUser: (userId: string, event: string, data: any) => {
    if (io && onlineUsers.has(userId)) {
      const socketIds = onlineUsers.get(userId);
      socketIds?.forEach(socketId => {
        io.to(socketId).emit(event, data);
      });
    }
  },

  getOnlineUsersInWorkspace: (workspaceMemberIds: string[]) => {
    return workspaceMemberIds.filter(id => onlineUsers.has(id));
  }
};
