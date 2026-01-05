import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <th className="p-4 text-left text-gray-500 font-semibold text-sm">Description</th>
                    <th className="p-4 text-right text-gray-500 font-semibold text-sm">Debit</th>
                    <th className="p-4 text-right text-gray-500 font-semibold text-sm">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-gray-100">
                      <td className="p-4 text-gray-600 text-[0.95rem]">
                        {new Date(transaction.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-gray-800 text-[0.95rem] font-medium">
                        {transaction.description || 'NONE'}
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
      </div>
    </CustomerLayout>
  );
};

export default CustomerTransactions;
