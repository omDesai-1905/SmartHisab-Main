import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { initializeSocket, disconnectSocket, onReceiveMessage, offReceiveMessage } from "../utils/socketService";

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatList();
    
    // Initialize socket for real-time updates
    const token = localStorage.getItem("token");
    if (token) {
      const socket = initializeSocket(token, 'user');
      
      // Update chat list when new message arrives
      const handleNewMessage = (message) => {
        fetchChatList(); // Refresh the list
      };
      
      onReceiveMessage(handleNewMessage);
      
      return () => {
        offReceiveMessage(handleNewMessage);
        disconnectSocket();
      };
    }
  }, []);

  const fetchChatList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/user/chat-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChatList(response.data.chatList || []);
    } catch (error) {
      console.error("Error fetching chat list:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (customerId, customerName) => {
    navigate(`/messages/chat/${customerId}`, { state: { customerName } });
  };

  const filteredChatList = chatList.filter((chat) =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB');
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-600 mt-2">Chat with your customers</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chat List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredChatList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">Start a conversation with your customers</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredChatList.map((chat) => (
                <div
                  key={chat.customerId}
                  onClick={() => openChat(chat.customerId, chat.customerName)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {chat.customerName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {chat.customerName}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {chat.lastMessage ? (
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          chat.unreadCount > 0 && chat.lastMessage.senderType === 'customer'
                            ? 'text-gray-900 font-semibold'
                            : 'text-gray-600'
                        }`}>
                          {chat.lastMessage.senderType === 'user' && (
                            <span className="mr-1">You: </span>
                          )}
                          {chat.lastMessage.message}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-green-500 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No messages yet</p>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatList;
