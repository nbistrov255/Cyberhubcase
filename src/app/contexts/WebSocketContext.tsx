import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Backend URL (без /api, так как WebSocket работает отдельно)
const SOCKET_URL = 'http://91.107.120.48:3000';

interface WebSocketContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // ✅ ИСПРАВЛЕНО: Опциональное использование AuthContext (может не быть в админке)
  let isAuthenticated = false;
  let profileId: string | undefined = undefined;

  try {
    // Пытаемся импортировать AuthContext только если он доступен
    const AuthContext = require('./AuthContext');
    if (AuthContext && AuthContext.useAuth) {
      const auth = AuthContext.useAuth();
      isAuthenticated = auth.isAuthenticated;
      profileId = auth.profile?.id;
    }
  } catch (error) {
    // AuthContext недоступен (например, в админке) - это нормально
    console.log('📡 WebSocket: AuthContext not available (admin mode?)');
  }

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Инициализация WebSocket соединения
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    
    // Создаем соединение
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      
      // Если пользователь авторизован, отправляем его ID
      if (isAuthenticated && profileId) {
        socket.emit('user:identify', { userId: profileId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔁 WebSocket reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔴 WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('💀 WebSocket reconnection failed');
    });

    // Cleanup при размонтировании
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, profileId]);

  // Методы для подписки/отписки от событий
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, ...args);
    }
  }, [isConnected]);

  const value: WebSocketContextType = {
    isConnected,
    lastUpdate,
    on,
    off,
    emit,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

// Хук для автоматического обновления при событии
export function useWebSocketEvent(event: string, callback: (...args: any[]) => void) {
  const { on, off } = useWebSocket();

  useEffect(() => {
    on(event, callback);
    return () => {
      off(event, callback);
    };
  }, [event, callback, on, off]);
}