'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef.current;
}
