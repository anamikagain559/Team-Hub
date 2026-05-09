"use client";
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import useAuthStore from './useAuthStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-production-4940.up.railway.app/api/v1';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: accessToken }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [accessToken]);

  return socketRef.current;
};
