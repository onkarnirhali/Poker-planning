// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Connects to the Socket.io server for a given session.
 * Automatically handles connect/disconnect.
 */
export function useSocket(sessionId: string): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Connect to your backend Socket.io namespace for sessions
    const socket = io('http://localhost:4000', {
      auth: { token },
      path: '/socket.io',     // default path unless your server config differs
      query: { sessionId },   // send sessionId so server can join you to that room
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  return socketRef.current;
}