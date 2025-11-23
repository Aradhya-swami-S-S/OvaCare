import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface AnonymousMessage {
  _id: string;
  content: string;
  username: 'Anonymous'; // Always anonymous
  timestamp: string;
  isAnonymous: true; // Always true
  isOwnMessage: boolean; // For styling purposes
}

interface SocketContextType {
  socket: Socket | null;
  messages: AnonymousMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  // onlineUsers removed for complete anonymity
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { token, user } = useAuth();
  const [pingInterval, setPingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to server after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('pong', () => {
        console.log('Received pong from server');
      });

      // Set up ping interval for connection health check
      const interval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000); // Ping every 30 seconds

      setPingInterval(interval);

      newSocket.on('recent_messages', (recentMessages: AnonymousMessage[]) => {
        // Ensure all messages are anonymous with proper styling info
        const anonymizedMessages = recentMessages.map(msg => ({
          ...msg,
          username: 'Anonymous' as const,
          isAnonymous: true as const,
          isOwnMessage: msg.isOwnMessage || false
        }));
        setMessages(anonymizedMessages);
      });

      newSocket.on('new_message', (message: AnonymousMessage) => {
        console.log('Received new message:', message);
        // Ensure message is anonymous with proper styling info
        const anonymizedMessage = {
          ...message,
          username: 'Anonymous' as const,
          isAnonymous: true as const,
          isOwnMessage: message.isOwnMessage || false
        };
        setMessages(prev => {
          // Prevent duplicate messages
          const messageExists = prev.some(msg => msg._id === anonymizedMessage._id);
          if (messageExists) {
            return prev;
          }
          return [...prev, anonymizedMessage];
        });
      });

      // user_count event removed for complete anonymity

      newSocket.on('user_typing', (data: { username: string; isTyping: boolean }) => {
        // Handle anonymous typing indicator from other users
        if (data.isTyping) {
          setIsTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      newSocket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      setSocket(newSocket);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
        newSocket.close();
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setMessages([]);
      }
      if (pingInterval) {
        clearInterval(pingInterval);
        setPingInterval(null);
      }
    }
  }, [token, user]);

  const sendMessage = (content: string) => {
    if (socket && content.trim()) {
      socket.emit('send_message', { content: content.trim() });
    }
  };

  const handleSetIsTyping = (typing: boolean) => {
    if (socket) {
      socket.emit('typing', { isTyping: typing });
    }
  };

  const value: SocketContextType = {
    socket,
    messages,
    isConnected,
    sendMessage,
    isTyping,
    setIsTyping: handleSetIsTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};