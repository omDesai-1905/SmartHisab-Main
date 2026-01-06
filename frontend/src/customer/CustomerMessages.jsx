import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    type: "general"
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/customerpanel/login");
      return;
    }

    fetchMessages(token);
  }, [navigate]);

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

      alert("Message sent successfully!");
      setShowMessageModal(false);
      setMessageForm({ subject: "", message: "", type: "general" });
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
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 m-0">
              Messages
            </h2>
            <button
              onClick={() => setShowMessageModal(true)}
              className="bg-blue-800 text-white px-6 py-3 rounded-lg border-none font-semibold cursor-pointer text-[0.95rem] flex items-center gap-2 hover:bg-indigo-500 transition-colors"
            >
              <span className="text-xl">+</span>
              New Message
            </button>
          </div>

          {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl text-gray-500 mb-2">
                  No messages yet
                </p>
                <p className="text-gray-400 mb-8">
                  Click "New Message" to contact your business owner
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-6 border border-gray-200 rounded-xl bg-[#fafafa]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 m-0">
                        {msg.subject}
                      </h3>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-3 py-1.5 rounded-md font-bold ${
                            msg.type === 'complaint' 
                              ? 'bg-red-100 text-red-900' 
                              : msg.type === 'dispute' 
                              ? 'bg-orange-100 text-orange-900' 
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {msg.type.toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-md font-bold ${
                            msg.status === 'resolved' 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : msg.status === 'in-progress' 
                              ? 'bg-amber-100 text-amber-900' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {msg.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[0.95rem] text-gray-600 m-0 mb-4 leading-relaxed">
                      {msg.message}
                    </p>
                    <p className="text-[0.85rem] text-gray-400 m-0">
                      📅 {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} at {new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {msg.reply && (
                      <div className="mt-4 p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                        <p className="text-[0.85rem] font-bold text-blue-900 m-0 mb-2">
                          💬 Reply from Business Owner:
                        </p>
                        <p className="text-[0.95rem] text-blue-950 m-0 leading-relaxed">
                          {msg.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowMessageModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-sky-100 text-sky-900 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold m-0">Send New Message</h3>
              <p className="opacity-90 mt-2 mb-0">Contact your business owner</p>
            </div>

            <form onSubmit={handleSendMessage} className="p-6">
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Message Type
                </label>
                <select
                  value={messageForm.type}
                  onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="complaint">Complaint</option>
                  <option value="dispute">Transaction Dispute</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Brief description"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base outline-none resize-y min-h-[120px] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageForm({ subject: "", message: "", type: "general" });
                  }}
                  className="flex-1 px-3.5 py-3.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className=" bg-sky-500 flex-1 px-3.5 py-3.5 border-none rounded-lg bg-blue-500 text-white font-semibold cursor-pointer text-base hover:bg-blue-600 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerMessages;
