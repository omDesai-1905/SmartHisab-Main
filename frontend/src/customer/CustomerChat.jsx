import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";
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
} from "../utils/socketService";

const CustomerChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [customer, setCustomer] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = JSON.parse(localStorage.getItem("customer") || "{}");

    if (!token) {
      navigate("/customerpanel/login");
      return;
    }

    setCustomer(customerData);
    fetchMessages(token);
    
    // Initialize socket
    if (token && customerData.customerId) {
      const socket = initializeSocket(token, 'customer');
      
      // Handle incoming messages
      const handleReceiveMessage = (message) => {
        if (message.senderType === 'user') {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      };
      
      // Handle message sent confirmation
      const handleMessageSent = (message) => {
        // Message already added optimistically
      };
      
      // Handle typing indicator
      const handleTyping = ({ userId, userType, isTyping }) => {
        if (userType === 'user') {
          setIsUserTyping(isTyping);
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
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (token) => {
    try {
      const response = await axios.get("/api/customer-portal/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter only chat type messages
      const chatMessages = (response.data.messages || []).filter(
        msg => msg.type === 'chat'
      );
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        navigate("/customerpanel/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !customer) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const token = localStorage.getItem("customerToken");
      
      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        message: messageText,
        senderType: "customer",
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      // Send via API for persistence
      const response = await axios.post(
        "/api/customer-portal/messages",
        { 
          message: messageText,
          type: "chat"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Send via socket for real-time delivery
      sendMessage({
        recipientId: customer.userId,
        recipientType: "user",
        message: messageText,
        customerId: customer.customerId,
        customerName: customer.name,
        userId: customer.userId,
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
    if (!customer) return;
    
    sendTypingIndicator(customer.userId, 'user', true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(customer.userId, 'user', false);
    }, 1000);
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
      <CustomerLayout currentPage="messages">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="chat">
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center shadow-md">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
            B
          </div>
          
          <div className="text-white">
            <h2 className="text-lg font-semibold">Business Owner</h2>
            {isUserTyping && (
              <p className="text-xs text-blue-100">typing...</p>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-semibold">No messages yet</p>
              <p className="text-sm mt-2">Send a message to your business owner!</p>
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
                    className={`flex mb-4 ${
                      message.senderType === 'customer' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                        message.senderType === 'customer'
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end ${
                        message.senderType === 'customer' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {message.senderType === 'customer' && (
                          <span className="ml-1">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
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
        <div className="bg-white border-t-2 border-gray-200 px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
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
    </CustomerLayout>
  );
};

export default CustomerChat;
