import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  initializeSocket,
  disconnectSocket,
  onReceiveMessage,
  onMessageSent,
  onMessageRead,
  onUserTyping,
  offReceiveMessage,
  offMessageSent,
  offMessageRead,
  offUserTyping,
  getSocket
} from '../utils/socketService';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (user && user.token) {
      const socket = initializeSocket(user.token, 'user');

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Handle incoming messages
      const handleReceiveMessage = (message) => {
        setMessages((prev) => [...prev, message]);
      };

      // Handle message sent confirmation
      const handleMessageSent = (message) => {
        setMessages((prev) => {
          const exists = prev.find(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      };

      // Handle message read status
      const handleMessageRead = ({ messageId }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      };

      // Handle typing indicator
      const handleUserTyping = ({ userId, userType, isTyping }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [`${userType}_${userId}`]: isTyping,
        }));

        // Clear typing after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) => ({
              ...prev,
              [`${userType}_${userId}`]: false,
            }));
          }, 3000);
        }
      };

      onReceiveMessage(handleReceiveMessage);
      onMessageSent(handleMessageSent);
      onMessageRead(handleMessageRead);
      onUserTyping(handleUserTyping);

      return () => {
        offReceiveMessage(handleReceiveMessage);
        offMessageSent(handleMessageSent);
        offMessageRead(handleMessageRead);
        offUserTyping(handleUserTyping);
        disconnectSocket();
      };
    }
  }, [user]);

  const value = {
    isConnected,
    messages,
    setMessages,
    typingUsers,
    socket: getSocket()
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
