import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const CustomerLayout = ({ children, currentPage }) => {
  const [customer, setCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");

    if (!token || !customerData) {
      navigate("/customer/login");
      return;
    }

    setCustomer(JSON.parse(customerData));
    
    // Fetch messages for badge count
    const fetchMessages = async () => {
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
      }
    };

    fetchMessages();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    navigate("/customer/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[99]" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200 flex flex-col z-[100] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-end mb-2">
            <button 
              className="text-3xl text-gray-600 hover:text-gray-800 leading-none"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary text-white w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl font-bold">
              {customer?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 leading-tight">
                {customer?.name}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {customer?.customerId}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav>
            <button
              onClick={() => {
                navigate("/customer/portal");
                setSidebarOpen(false);
              }}
              className={`w-full py-3.5 px-4 rounded-lg border-none font-semibold text-[0.95rem] cursor-pointer text-left mb-2 flex items-center gap-3 transition-all ${
                currentPage === 'portal' 
                  ? 'bg-primary text-primary-dark' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">🏠</span>
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/customer/transactions");
                setSidebarOpen(false);
              }}
              className={`w-full py-3.5 px-4 rounded-lg border-none font-semibold text-[0.95rem] cursor-pointer text-left mb-2 flex items-center gap-3 transition-all ${
                currentPage === 'transactions' 
                  ? 'bg-primary text-primary-dark' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">📋</span>
              Transaction History
            </button>
            <button
              onClick={() => {
                navigate("/customer/messages");
                setSidebarOpen(false);
              }}
              className={`w-full py-3.5 px-4 rounded-lg border-none font-semibold text-[0.95rem] cursor-pointer text-left flex items-center gap-3 transition-all ${
                currentPage === 'messages' 
                  ? 'bg-primary text-primary-dark' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">💬</span>
              Messages
              {messages.filter(m => m.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-[0.7rem] py-0.5 px-2 rounded-full font-bold ml-auto">
                  {messages.filter(m => m.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-lg border-none bg-red-500 text-white font-semibold text-[0.95rem] cursor-pointer flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Menu Button */}
        <div className="sticky top-0 bg-white shadow-md z-50 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-gray-700 hover:text-gray-900"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {currentPage === 'portal' && 'Dashboard'}
            {currentPage === 'transactions' && 'Transaction History'}
            {currentPage === 'messages' && 'Messages'}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CustomerLayout;
