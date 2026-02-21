import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

let socket = null;

export const initializeSocket = (token, userType) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
      userType, // 'user' or 'customer'
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket.io connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket.io disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.io connection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (data) => {
  if (socket && socket.connected) {
    socket.emit("send_message", data);
  } else {
    console.error("Socket not connected");
  }
};

export const markMessageAsRead = (messageId, recipientId, recipientType) => {
  if (socket && socket.connected) {
    socket.emit("mark_read", { messageId, recipientId, recipientType });
  }
};

export const sendTypingIndicator = (recipientId, recipientType, isTyping) => {
  if (socket && socket.connected) {
    socket.emit("typing", { recipientId, recipientType, isTyping });
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on("receive_message", callback);
  }
};

export const onMessageSent = (callback) => {
  if (socket) {
    socket.on("message_sent", callback);
  }
};

export const onMessageRead = (callback) => {
  if (socket) {
    socket.on("message_read", callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on("user_typing", callback);
  }
};

export const offReceiveMessage = (callback) => {
  if (socket) {
    socket.off("receive_message", callback);
  }
};

export const offMessageSent = (callback) => {
  if (socket) {
    socket.off("message_sent", callback);
  }
};

export const offMessageRead = (callback) => {
  if (socket) {
    socket.off("message_read", callback);
  }
};

export const offUserTyping = (callback) => {
  if (socket) {
    socket.off("user_typing", callback);
  }
};
