import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerPortal = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customer/login");
      return;
    }

    fetchTransactions(token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const response = await axios.get(
        "/api/customer-portal/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) {
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalCredit - totalDebit;

  if (loading) {
    return (
      <CustomerLayout currentPage="portal">
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
    <CustomerLayout currentPage="portal">
      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h1>
          <p className="text-base text-gray-500">
            Here's an overview of your account
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Credit Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#658C58]">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-3xl">💰</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Total Credit
            </h3>
            <p className="text-4xl font-bold text-green-600 mb-2">
              ₹{totalCredit.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              All incoming payments
            </p>
          </div>

          {/* Total Debit Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#A72703]">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <span className="text-3xl">💸</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Total Debit
            </h3>
            <p className="text-4xl font-bold text-red-600 mb-2">
              ₹{totalDebit.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              All outgoing payments
            </p>
          </div>

          {/* Balance Card */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border-2 ${balance >= 0 ? 'border-[#3B9797]' : 'border-[#BF092F]'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <span className="text-3xl">{balance >= 0 ? '📈' : '📉'}</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Current Balance
            </h3>
            <p className={`text-4xl font-bold mb-2 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ₹{balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              {balance >= 0 ? 'You have receivable' : 'You have payable'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/customer/transactions")}
              className="p-6 rounded-xl border-2 border-blue-500 bg-blue-50 text-[#4E56C0] font-semibold text-base cursor-pointer flex items-center gap-4 transition-all hover:-translate-y-0.5 shadow-md shadow-blue-200"
            >
              <span className="text-3xl">📋</span>
              <div className="text-left">
                <div className="text-lg font-bold">View All Transactions</div>
                <div className="text-sm opacity-90 mt-1">
                  See your complete transaction history
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/customer/messages")}
              className="p-6 rounded-xl border-2 border-green-500 bg-green-50 text-green-600 font-semibold text-base cursor-pointer flex items-center gap-4 transition-all hover:-translate-y-0.5 shadow-md shadow-green-200"
            >
              <span className="text-3xl">💬</span>
              <div className="text-left flex-1">
                <div className="text-lg font-bold">Send Message</div>
                <div className="text-sm opacity-90 mt-1">
                  Contact your business owner
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerPortal;
