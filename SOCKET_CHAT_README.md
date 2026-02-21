# Socket.io Real-Time Chat Implementation

## Overview

This implementation adds WhatsApp-like real-time chat functionality to SmartHisab using Socket.io.

### Features

- **Real-time messaging** - Messages are delivered instantly without page refresh
- **Typing indicators** - See when the other person is typing
- **Read receipts** - Double checkmark when messages are read
- **User chat list** - Users can see all their customers with unread message counts
- **Customer chat** - Customers can only chat with their business owner
- **Message persistence** - All messages are stored in MongoDB
- **Reconnection handling** - Automatic reconnection on connection loss

## Architecture

### Backend

1. **Custom Server** (`backend/server.js`)
   - Next.js custom server with Socket.io integration
   - Handles WebSocket connections
   - JWT authentication for socket connections
   - Manages user and customer socket connections

2. **Updated Model** (`backend/src/models/CustomerMessage.js`)
   - Added `senderType` field (user or customer)
   - Added `senderId` field
   - Added 'chat' type for chat messages
   - Made `subject` optional for chat messages

3. **API Routes**
   - `/api/user/chat-list` - Get all customers with last message and unread count
   - `/api/user/customer-messages/[customerId]` - Get/send/mark read messages with specific customer
   - `/api/customer-portal/messages` - Get/send messages for customer

### Frontend

1. **Socket Service** (`frontend/src/utils/socketService.js`)
   - Socket.io client connection management
   - Helper functions for sending messages, typing indicators, etc.

2. **Context Providers**
   - `SocketContext.jsx` - Manages socket connection for users
   - `CustomerSocketContext.jsx` - Manages socket connection for customers

3. **Components**
   - `ChatList.jsx` - Shows all customers with last messages (for users)
   - `ChatWindow.jsx` - Chat interface for user-customer conversation
   - `CustomerChat.jsx` - Chat interface for customers

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install socket.io

# Frontend
cd frontend
npm install socket.io-client
```

### 2. Environment Variables

**Backend** (`backend/.env`):

```env
MONGODB_URI=mongodb://localhost:27017/smarthisab
JWT_SECRET=your-secret-key-here
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** (`frontend/.env`):

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. Start the Application

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## Usage

### For Users (Business Owners)

1. Navigate to **Messages** in the sidebar
2. See a list of all customers with:
   - Last message preview
   - Timestamp
   - Unread message count (green badge)
3. Click on a customer to open the chat
4. Send messages in real-time
5. See typing indicators when customer is typing
6. Messages show ✓ when sent, ✓✓ when read

### For Customers

1. Navigate to **Chat** in the sidebar
2. Chat directly with the business owner
3. Send messages in real-time
4. See typing indicators when owner is typing
5. Messages show ✓ when sent, ✓✓ when read

## Socket Events

### Client to Server

- `send_message` - Send a new message
- `mark_read` - Mark message as read
- `typing` - Send typing indicator

### Server to Client

- `receive_message` - Receive a new message
- `message_sent` - Confirmation that message was sent
- `message_read` - Notification that message was read
- `user_typing` - Notification that other user is typing
- `message_error` - Error occurred while sending message

## Database Schema

```javascript
{
  customerId: ObjectId,
  customerName: String,
  userId: ObjectId,
  userEmail: String,
  message: String,
  senderType: "user" | "customer",
  senderId: ObjectId,
  type: "chat" | "dispute" | "general" | "complaint",
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

- Socket connections are authenticated using JWT tokens
- Tokens are passed during socket handshake
- User type ('user' or 'customer') is validated
- Invalid tokens are rejected

## Deployment Considerations

### Production Environment

1. **Environment Variables**
   - Update `FRONTEND_URL` to production domain
   - Use strong `JWT_SECRET`
   - Set `NODE_ENV=production`

2. **CORS Configuration**
   - Update CORS origin in `server.js`
   - Whitelist production domains

3. **Server Deployment**
   - Use process manager (PM2, systemd)
   - Enable SSL/TLS for secure WebSocket connections (wss://)
   - Configure load balancer for sticky sessions

4. **Scaling Considerations**
   - Socket.io requires sticky sessions for horizontal scaling
   - Consider Redis adapter for multi-server deployments
   - Use queue system for message persistence

## Troubleshooting

### Socket Connection Issues

1. **Check CORS settings** - Ensure `FRONTEND_URL` matches your frontend URL
2. **Verify JWT token** - Check token is valid and not expired
3. **Check network** - WebSocket connections may be blocked by firewalls
4. **Browser console** - Check for connection errors

### Messages Not Delivering

1. **Check socket connection** - Ensure both users are connected
2. **Check database** - Verify messages are being saved
3. **Check authentication** - Ensure JWT tokens are valid
4. **Check logs** - Look for errors in server logs

## Future Enhancements

- [ ] Message attachments (images, files)
- [ ] Voice messages
- [ ] Group chats
- [ ] Message search
- [ ] Message deletion
- [ ] Online/offline status
- [ ] Last seen timestamp
- [ ] Push notifications
- [ ] Message reactions
- [ ] Forwarding messages
- [ ] Reply to specific messages

## License

This implementation is part of SmartHisab project.
