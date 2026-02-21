import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Store active connections: userId/customerId -> socketId
const userSockets = new Map(); // userId -> socketId
const customerSockets = new Map(); // customerId -> socketId

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
  });

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userType = socket.handshake.auth.userType; // 'user' or 'customer'

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userType = userType;
      socket.userId = decoded.userId || decoded.customerId;
      socket.decoded = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`${socket.userType} connected: ${socket.userId}`);

    // Register user/customer socket
    if (socket.userType === "user") {
      userSockets.set(socket.userId, socket.id);
    } else if (socket.userType === "customer") {
      customerSockets.set(socket.userId, socket.id);

      // Join a room with their associated user (business owner)
      // The customerId includes their userId reference
      if (socket.decoded.userId) {
        socket.join(`user_${socket.decoded.userId}`);
      }
    }

    // Handle sending a message
    socket.on("send_message", async (data) => {
      try {
        const {
          recipientId,
          recipientType,
          message,
          customerId,
          customerName,
          userId,
          userEmail,
        } = data;

        // Create message object
        const messageData = {
          ...data,
          senderId: socket.userId,
          senderType: socket.userType,
          timestamp: new Date(),
          isRead: false,
        };

        // Emit to recipient
        if (recipientType === "user") {
          const recipientSocketId = userSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_message", messageData);
          }
        } else if (recipientType === "customer") {
          const recipientSocketId = customerSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_message", messageData);
          }
        }

        // Send confirmation back to sender
        socket.emit("message_sent", messageData);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", { error: error.message });
      }
    });

    // Handle message read status
    socket.on("mark_read", (data) => {
      const { messageId, recipientId, recipientType } = data;

      if (recipientType === "user") {
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message_read", { messageId });
        }
      } else if (recipientType === "customer") {
        const recipientSocketId = customerSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message_read", { messageId });
        }
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { recipientId, recipientType, isTyping } = data;

      if (recipientType === "user") {
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("user_typing", {
            userId: socket.userId,
            userType: socket.userType,
            isTyping,
          });
        }
      } else if (recipientType === "customer") {
        const recipientSocketId = customerSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("user_typing", {
            userId: socket.userId,
            userType: socket.userType,
            isTyping,
          });
        }
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`${socket.userType} disconnected: ${socket.userId}`);

      if (socket.userType === "user") {
        userSockets.delete(socket.userId);
      } else if (socket.userType === "customer") {
        customerSockets.delete(socket.userId);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server is running`);
    });
});
