import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import {
  initializeSocket,
  disconnectSocket,
  sendMessage,
  onReceiveMessage,
  onMessageSent,
  sendTypingIndicator,
  onUserTyping,
  offReceiveMessage,
  offMessageSent,
  offUserTyping,
  markMessageAsRead
} from "../utils/socketService";

const ChatWindow = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState(location.state?.customerName || "Customer");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Initialize socket
    const token = localStorage.getItem("token");
    if (token) {
      const socket = initializeSocket(token, 'user');
      
      // Handle incoming messages
      const handleReceiveMessage = (message) => {
        if (message.customerId === customerId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
          
          // Mark as read
          markMessageAsRead(message._id, customerId, 'customer');
        }
      };
      
      // Handle message sent confirmation
      const handleMessageSent = (message) => {
        if (message.customerId === customerId) {
          // Message already added optimistically, just update if needed
        }
      };
      
      // Handle typing indicator
      const handleTyping = ({ userId, userType, isTyping }) => {
        if (userType === 'customer' && userId === customerId) {
          setIsTyping(isTyping);
        }
      };
      
      onReceiveMessage(handleReceiveMessage);
      onMessageSent(handleMessageSent);
      onUserTyping(handleTyping);
      
      return () => {
        offReceiveMessage(handleReceiveMessage);
        offMessageSent(handleMessageSent);
        offUserTyping(handleTyping);
        disconnectSocket();
      };
    }
  }, [customerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/user/chat/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages || []);
      
      // Mark all messages as read
      await axios.patch(
        `/api/user/chat/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        message: messageText,
        senderType: "user",
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      // Send via API for persistence
      const response = await axios.post(
        `/api/user/chat/${customerId}`,
        { message: messageText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Send via socket for real-time delivery
      sendMessage({
        recipientId: customerId,
        recipientType: "customer",
        message: messageText,
        customerId: customerId,
        userId: user.userId,
      });

      // Update with actual message from server
      setMessages((prev) => 
        prev.map((msg) => 
          msg._id === tempMessage._id ? response.data.data : msg
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    sendTypingIndicator(customerId, 'customer', true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(customerId, 'customer', false);
    }, 1000);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedMessages([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      alert("Please select messages to delete");
      return;
    }

    const count = selectedMessages.length;
    if (!window.confirm(`Are you sure you want to delete ${count} message(s)?`)) {
      return;
    }

    setDeletingMultiple(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/user/chat/delete-multiple`,
        { messageIds: selectedMessages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove deleted messages from UI
      setMessages((prev) => prev.filter((msg) => !selectedMessages.includes(msg._id)));
      setSelectedMessages([]);
      setSelectionMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
      alert("Failed to delete messages. Please try again.");
    } finally {
      setDeletingMultiple(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB');
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/messages')}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold mr-3">
              {customerName.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{customerName}</h2>
              {isTyping && (
                <p className="text-xs text-green-600">typing...</p>
              )}
            </div>
          </div>

          {/* Selection Mode Controls */}
          <div className="flex items-center gap-2">
            {selectionMode && (
              <>
                <button
                  onClick={selectAllMessages}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedMessages.length === messages.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedMessages.length} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedMessages.length === 0 || deletingMultiple}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                >
                  {deletingMultiple ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
                </button>
              </>
            )}
            <button
              onClick={toggleSelectionMode}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectionMode
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {selectionMode ? 'Cancel' : 'Select'}
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            Object.keys(groupedMessages).map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex justify-center my-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                    {formatDateHeader(groupedMessages[date][0].createdAt)}
                  </span>
                </div>

                {/* Messages */}
                {groupedMessages[date].map((message) => (
                  <div
                    key={message._id}
                    className={`flex mb-4 items-start gap-2 ${
                      message.senderType === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Checkbox for selection mode - show for all messages */}
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message._id)}
                        onChange={() => toggleMessageSelection(message._id)}
                        className="mt-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    )}

                    <div className="relative group">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                          message.senderType === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none'
                        } ${
                          selectionMode && selectedMessages.includes(message._id)
                            ? 'ring-2 ring-blue-600'
                            : ''
                        }`}
                      >
                        <p className="text-sm break-words">{message.message}</p>
                        <div className={`text-xs mt-1 flex items-center justify-end ${
                          message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {message.senderType === 'user' && (
                            <span className="ml-1">
                              {message.isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {sending ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatWindow;
