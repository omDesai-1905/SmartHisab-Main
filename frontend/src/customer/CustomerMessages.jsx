import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({
    message: "",
    type: "chat"
  });
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/customerpanel/login");
      return;
    }

    fetchMessages(token);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (token) => {
    try {
      const response = await axios.get(
        "/api/customer-portal/messages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Messages are already sorted by API (oldest first)
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        navigate("/customerpanel/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.message.trim()) return;

    const token = localStorage.getItem("customerToken");

    try {
      await axios.post(
        "/api/customer-portal/messages",
        messageForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageForm({ message: "", type: "chat" });
      fetchMessages(token);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

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
    <CustomerLayout currentPage="messages">
      <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/customerpanel/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors border-none bg-transparent cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">B</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 m-0">Business Support</h2>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-[#f5f5f5]"
        >
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-600 mb-2">
                No messages yet
              </p>
              <p className="text-gray-500">
                Start a conversation with your business owner
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-w-4xl mx-auto">
              {/* Today Label */}
              {messages.length > 0 && (
                <div className="flex justify-center mb-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                    Today
                  </span>
                </div>
              )}
              
              {messages.map((msg) => {
                const isCustomerMessage = msg.senderType === "customer";
                
                return (
                  <div key={msg._id} className="mb-2">
                    {isCustomerMessage ? (
                      /* Customer's message (right side - sent) */
                      <div className="flex justify-end">
                        <div className="max-w-[70%]">
                          <div className="bg-[#0084ff] text-white rounded-2xl px-4 py-2 shadow-sm">
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1 px-2">
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-blue-500">
                              <path fillRule="evenodd" d="M15.03 3.97a.75.75 0 0 1 0 1.06l-8.5 8.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L6 11.94l7.97-7.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Business owner's message (left side - received) */
                      <div className="flex justify-start">
                        <div className="max-w-[70%]">
                          <div className="bg-white text-gray-900 rounded-2xl px-4 py-2 shadow-sm">
                            <p className="text-xs font-semibold text-blue-600 mb-1">
                              Business Owner
                            </p>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-2">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-center">
              {/* Message input */}
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center">
                <input
                  type="text"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Type a message..."
                  className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={!messageForm.message.trim()}
                className="w-10 h-10 bg-[#0084ff] text-white rounded-full hover:bg-[#0073e6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed border-none flex items-center justify-center"
                title="Send Message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerMessages;
