import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/customerpanel/login");
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
        navigate("/customerpanel/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalDebit = transactions.reduce((sum, t) => t.type === 'debit' ? sum + t.amount : sum, 0);
  const totalCredit = transactions.reduce((sum, t) => t.type === 'credit' ? sum + t.amount : sum, 0);
  const balance = totalDebit - totalCredit;

  if (loading) {
    return (
      <CustomerLayout currentPage="transactions">
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
    <CustomerLayout currentPage="transactions">
      <div className="max-w-7xl mx-auto p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-6 mb-6">
          {/* Total Debit Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <span className="text-[0.6rem] md:text-sm font-semibold text-red-700 uppercase tracking-wide">Total Debit</span>
              <span className="text-base md:text-2xl">📤</span>
            </div>
            <div className="text-sm md:text-3xl font-bold text-red-600">₹{totalDebit.toLocaleString()}</div>
            <p className="text-[0.55rem] md:text-xs text-red-600 mt-0.5 md:mt-1 font-medium">You Gave</p>
          </div>

          {/* Total Credit Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <span className="text-[0.6rem] md:text-sm font-semibold text-green-700 uppercase tracking-wide">Total Credit</span>
              <span className="text-base md:text-2xl">📥</span>
            </div>
            <div className="text-sm md:text-3xl font-bold text-green-600">₹{totalCredit.toLocaleString()}</div>
            <p className="text-[0.55rem] md:text-xs text-green-600 mt-0.5 md:mt-1 font-medium">You Got</p>
          </div>

          {/* Balance Card */}
          <div className={`bg-gradient-to-br rounded-lg md:rounded-xl p-3 md:p-6 border shadow-sm ${
            balance > 0 
              ? 'from-blue-50 to-blue-100 border-blue-200' 
              : balance < 0 
              ? 'from-orange-50 to-orange-100 border-orange-200'
              : 'from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <span className={`text-[0.6rem] md:text-sm font-semibold uppercase tracking-wide ${
                balance > 0 ? 'text-blue-700' : balance < 0 ? 'text-orange-700' : 'text-gray-700'
              }`}>Balance</span>
              <span className="text-base md:text-2xl">{balance > 0 ? '💰' : balance < 0 ? '⚠️' : '✅'}</span>
            </div>
            <div className={`text-sm md:text-3xl font-bold ${
              balance > 0 ? 'text-blue-600' : balance < 0 ? 'text-orange-600' : 'text-gray-600'
            }`}>₹{Math.abs(balance).toLocaleString()}</div>
            <p className={`text-[0.55rem] md:text-xs mt-0.5 md:mt-1 font-medium ${
              balance > 0 ? 'text-blue-600' : balance < 0 ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {balance > 0 ? 'You will get' : balance < 0 ? 'You will give' : 'Settled'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by description or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Transaction History
          </h2>

          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No transactions found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="p-4 text-left text-gray-500 font-semibold text-sm">Date</th>
                    <th className="p-4 text-right text-gray-500 font-semibold text-sm">Debit</th>
                    <th className="p-4 text-right text-gray-500 font-semibold text-sm">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <td className="p-4 text-gray-600 text-[0.95rem]">
                        {new Date(transaction.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right text-red-500 font-semibold text-base">
                        {transaction.type === 'debit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4 text-right text-emerald-500 font-semibold text-base">
                        {transaction.type === 'credit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    selectedTransaction.type === 'debit' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {selectedTransaction.type === 'debit' ? '📤' : '📥'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                    <p className="text-sm text-gray-500">
                      {selectedTransaction.type === 'debit' ? 'Debit (You Gave)' : 'Credit (You Got)'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Date</div>
                  <div className="text-lg text-gray-800">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Amount</div>
                  <div className={`text-3xl font-bold ${
                    selectedTransaction.type === 'debit' ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    ₹{selectedTransaction.amount.toLocaleString()}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-base text-gray-800 whitespace-pre-wrap break-words font-mono">
                    {selectedTransaction.description || 'NONE'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerTransactions;
