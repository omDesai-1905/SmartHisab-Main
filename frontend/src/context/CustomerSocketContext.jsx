import React, { createContext, useContext, useEffect, useState } from 'react';
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

const CustomerSocketContext = createContext();

export const CustomerSocketProvider = ({ children, customer }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  useEffect(() => {
    if (customer && customer.token) {
      const socket = initializeSocket(customer.token, 'customer');

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
        if (userType === 'user') {
          setIsUserTyping(isTyping);
          
          // Clear typing after 3 seconds
          if (isTyping) {
            setTimeout(() => {
              setIsUserTyping(false);
            }, 3000);
          }
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
  }, [customer]);

  const value = {
    isConnected,
    messages,
    setMessages,
    isUserTyping,
    socket: getSocket()
  };

  return (
    <CustomerSocketContext.Provider value={value}>
      {children}
    </CustomerSocketContext.Provider>
  );
};

export const useCustomerSocket = () => {
  const context = useContext(CustomerSocketContext);
  if (!context) {
    throw new Error('useCustomerSocket must be used within a CustomerSocketProvider');
  }
  return context;
};
