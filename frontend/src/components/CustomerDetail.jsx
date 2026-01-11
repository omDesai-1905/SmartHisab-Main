import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('debit');
  const [newTransaction, setNewTransaction] = useState({ 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] // Default to today's date
  });

  // Helper: sanitize numeric input (allow digits and one decimal point)
  const sanitizeNumericInput = (val) => {
    if (typeof val !== 'string') val = String(val || '');
    // remove commas and any non digit/dot chars
    let s = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
    // allow only a single dot
    const parts = s.split('.');
    if (parts.length > 2) {
      s = parts[0] + '.' + parts.slice(1).join('');
    }
    return s;
  };
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTransactions([]);
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const toggleSelectAll = () => {
    const currentTransactions = searchTerm ? filteredTransactions : transactions;
    if (selectedTransactions.length === currentTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(currentTransactions.map(t => t._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedTransactions.map(transactionId =>
          axios.delete(`/api/customers/${id}/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t._id)));
      showNotification(`Successfully deleted ${selectedTransactions.length} transaction(s)`);
      setSelectedTransactions([]);
      setSelectionMode(false);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      showNotification('Failed to delete some transactions', 'error');
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA; // Newest first
  });

  const fetchPassword = async () => {
    if (passwordData) return; // Already fetched
    
    setLoadingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/customers/${id}/password`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPasswordData(response.data);
    } catch (error) {
      console.error('Error fetching password:', error);
      showNotification('Failed to fetch password', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleEyeClick = () => {
    if (showPassword) {
      // Hide password
      setShowPassword(false);
    } else {
      // Show confirmation modal
      setShowConfirmPasswordModal(true);
      setConfirmPassword('');
      setConfirmPasswordError('');
    }
  };

  const verifyAndShowPassword = async () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please enter your password');
      return;
    }

    setVerifyingPassword(true);
    setConfirmPasswordError('');

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Verify password by attempting login
      const response = await axios.post('/api/auth/login', {
        email: userData.email,
        password: confirmPassword,
      });

      if (response.data.token) {
        // Password is correct
        setShowPassword(true);
        setShowConfirmPasswordModal(false);
        setConfirmPassword('');
        showNotification('Password verified', 'success');
      }
    } catch (error) {
      setConfirmPasswordError('Incorrect password. Please try again.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`/api/customers/${id}/transactions`);
      setCustomer(response.data.customer);
      // Fetch password data immediately
      fetchPassword();

      const sortedTransactions = response.data.transactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA; // Newest first
      });
      
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateTransactionForm = () => {
    const newErrors = {};
    const sanitizedAmount = sanitizeNumericInput(newTransaction.amount);

    if (!sanitizedAmount || isNaN(parseFloat(sanitizedAmount)) || parseFloat(sanitizedAmount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!newTransaction.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(newTransaction.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTransactionForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;
  const description = newTransaction.description.trim() || 'NONE';
  const amount = parseFloat(sanitizeNumericInput(newTransaction.amount));
      
      if (modalType === 'add') {
        response = await axios.post(`/api/customers/${id}/transactions`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: newTransaction.date
        });

        setTransactions(prev => {
          const newTransactions = [response.data, ...prev];
          return newTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA; // Newest first
          });
        });
      } else {
        response = await axios.put(`/api/customers/${id}/transactions/${selectedTransaction._id}`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: newTransaction.date
        });

        setTransactions(prev => {
          const updatedTransactions = prev.map(transaction => 
            transaction._id === selectedTransaction._id 
              ? response.data
              : transaction
          );
          return updatedTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA; // Newest first
          });
        });
      }
      
      setNewTransaction({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setSelectedTransaction(null);
      setErrors({});
      setShowModal(false);
      showNotification(`Transaction ${modalType === 'add' ? 'added' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification(error.response?.data?.message || `Failed to ${modalType} transaction`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openTransactionModal = (type) => {
    setModalType('add');
    setTransactionType(type);
    setNewTransaction({ 
      amount: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setSelectedTransaction(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setModalType('edit');
    setSelectedTransaction(transaction);
    setTransactionType(transaction.type);
    setNewTransaction({ 
      amount: transaction.amount.toString(), 
      description: transaction.description,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      await axios.delete(`/api/customers/${id}/transactions/${transaction._id}`);
      
      setTransactions(prev => prev.filter(t => t._id !== transaction._id));
      
      setShowActionModal(false);
      setShowConfirmModal(false);
      setSelectedTransaction(null);
      
      showNotification(`${transaction.type === 'debit' ? 'Debit' : 'Credit'} transaction deleted successfully`, 'success');
      
      await fetchCustomerData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Failed to delete transaction. Please try again.', 'error');
    }
  };

  const handleDeleteClick = () => {
    setShowActionModal(false);
    setShowConfirmModal(true);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowActionModal(true);
  };

  const handleUpdateClick = () => {
    setShowActionModal(false);
    openEditTransactionModal(selectedTransaction);
  };

  const confirmDelete = () => {
    handleDeleteTransaction(selectedTransaction);
  };

  const calculateBalance = () => {
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    });
    return balance;
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout currentPage="/customer">
        <div className="container">
          <div className="loading">Loading customer details...</div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout currentPage="/customer">
        <div className="container">
          <div className="loading">Customer not found</div>
        </div>
      </Layout>
    );
  }

  const balance = calculateBalance();

  return (
    <Layout currentPage="/customer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Customer Info & Balance */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
              <p className="text-lg text-gray-600 mb-4">📞 {customer.phone}</p>
              
              <div className="pt-4 border-t border-gray-200">
                <span className="text-lg text-gray-600">Current Balance: </span>
                <span className={`text-2xl font-bold ${
                  balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formatAmount(Math.abs(balance))}
                  {balance > 0 && ' (You will give)'}
                  {balance < 0 && ' (You will get)'}
                  {balance === 0 && ' (No balance)'}
                </span>
              </div>
            </div>
            
            {/* Right: Credentials Box */}
            {passwordData && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 lg:w-80 lg:flex-shrink-0">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-blue-800">
                    🔑 Customer Portal Login
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Customer ID:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-semibold text-gray-900 font-mono flex-1 truncate">
                        {passwordData.customerId}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(passwordData.customerId);
                          showNotification('ID copied!', 'success');
                        }}
                        className="px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Password:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-semibold text-red-600 font-mono flex-1">
                        {showPassword ? passwordData.password : '••••••••'}
                      </span>
                      <button
                        onClick={handleEyeClick}
                        className="px-1 py-0.5 text-base hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                        title={showPassword ? "Hide" : "Show"}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-blue-200">
                    <span className="text-[10px] text-blue-700 block truncate">
                      <a href="/customerpanel/login" className="underline hover:text-blue-900">Portal Login</a>
                    </span>
                  </div>
                </div>
              </div>
            )}
            {loadingPassword && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 lg:w-80 lg:flex-shrink-0">
                <div className="text-center text-sm text-gray-600">Loading...</div>
              </div>
            )}
          </div>
        </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => openTransactionModal('debit')}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
             Add Debit (You Gave)
          </button>
          <button 
            onClick={() => openTransactionModal('credit')}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
             Add Credit (You Got)
          </button>
        </div>

      {/* Search Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Transactions
        </label>
        <input
          type="text"
          placeholder="Search by description or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
        />
      </div>

      {/* Selection Mode Controls */}
      {transactions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={toggleSelectionMode}
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-medium text-sm md:text-base transition-all ${
              selectionMode 
                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
          
          {selectionMode && (
            <>
              <button
                onClick={toggleSelectAll}
                className="px-3 md:px-6 py-2 md:py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm md:text-base transition-all"
              >
                {selectedTransactions.length === (searchTerm ? filteredTransactions : transactions).length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedTransactions.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-3 md:px-6 py-2 md:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap"
                >
                  Delete ({selectedTransactions.length})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 p-6 pb-0">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions found. Add the first transaction to get started!
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  {filteredTransactions.length === 0 
                    ? `No transactions found matching "${searchTerm}"` 
                    : `Found ${filteredTransactions.length} transaction(s) matching "${searchTerm}"`
                  }
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {selectionMode && (
                        <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700 w-12"></th>
                      )}
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Description</th>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Debit</th>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchTerm ? filteredTransactions : transactions).map((transaction) => (
                    <tr 
                      key={transaction._id}
                      onClick={() => {
                        if (!selectionMode) {
                          setSelectedTransaction(transaction);
                          setShowDetailModal(true);
                        }
                      }}
                      className={`border-b border-gray-100 transition-colors ${
                        selectionMode 
                          ? 'hover:bg-blue-50' 
                          : 'hover:bg-gray-50 cursor-pointer'
                      } ${
                        selectedTransactions.includes(transaction._id) ? 'bg-blue-100' : ''
                      }`}
                    >
                      {selectionMode && (
                        <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction._id)}
                            onChange={() => toggleTransactionSelection(transaction._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-900">{formatDate(transaction.date || transaction.createdAt)}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">{transaction.description || 'NONE'}</td>
                      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-red-600">
                        {transaction.type === 'debit' ? formatAmount(transaction.amount) : '-'}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-green-600">
                        {transaction.type === 'credit' ? formatAmount(transaction.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalType === 'add' 
                    ? `Add ${transactionType === 'debit' ? 'Debit' : 'Credit'} Transaction`
                    : `Edit ${transactionType === 'debit' ? 'Debit' : 'Credit'} Transaction`
                  }
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none w-8 h-8 flex items-center justify-center"
                  onClick={() => {
                    setShowModal(false);
                    setNewTransaction({ 
                      amount: '', 
                      description: '', 
                      date: new Date().toISOString().split('T')[0] 
                    });
                    setSelectedTransaction(null);
                    setErrors({});
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="p-6">
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={newTransaction.date}
                    onChange={(e) => {
                      setNewTransaction(prev => ({ ...prev, date: e.target.value }));
                      if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  />
                  {errors.date && <div className="text-red-600 text-sm mt-1">{errors.date}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    {transactionType === 'debit' ? 'You Gave (₹)' : 'You Got (₹)'}
                  </label>
                  <input
                    type="text"
                    id="amount"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={newTransaction.amount}
                    onChange={(e) => {
                      const sanitized = sanitizeNumericInput(e.target.value);
                      setNewTransaction(prev => ({ ...prev, amount: sanitized }));
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={`Enter ${transactionType === 'debit' ? 'debit' : 'credit'} amount`}
                  />
                  {errors.amount && <div className="text-red-600 text-sm mt-1">{errors.amount}</div>}
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows="2"
                    value={newTransaction.description}
                    onChange={(e) => {
                      setNewTransaction(prev => ({ ...prev, description: e.target.value }));
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px] ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={`Enter ${transactionType === 'debit' ? 'debit' : 'credit'} description (optional - will show 'NONE' if empty)`}
                  />
                  {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                </div>

                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewTransaction({ 
                        amount: '', 
                        description: '', 
                        date: new Date().toISOString().split('T')[0] 
                      });
                      setSelectedTransaction(null);
                      setErrors({});
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-6 py-2 font-medium rounded-lg transition-colors text-white ${
                      transactionType === 'debit' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    disabled={submitting}
                  >
                    {submitting 
                      ? (modalType === 'add' ? 'Adding...' : 'Updating...') 
                      : (modalType === 'add' 
                          ? `Add ${transactionType === 'debit' ? 'Debit' : 'Credit'}` 
                          : `Update ${transactionType === 'debit' ? 'Debit' : 'Credit'}`
                        )
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {showActionModal && selectedTransaction && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              maxWidth: '420px',
              width: '100%',
              overflow: 'hidden',
              transform: 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: selectedTransaction.type === 'debit' ? '#fee2e2' : '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: selectedTransaction.type === 'debit' ? '#dc2626' : '#16a34a'
                  }}>
                    {selectedTransaction.type === 'debit' ? '−' : '+'}
                  </div>
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      Transaction Details
                    </h2>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      Choose an action for this transaction
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedTransaction(null);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                {/* Transaction Details Card */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Transaction Type Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Transaction Type
                    </span>
                    <span style={{
                      backgroundColor: selectedTransaction.type === 'debit' ? '#fef2f2' : '#f0fdf4',
                      color: selectedTransaction.type === 'debit' ? '#dc2626' : '#16a34a',
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: `2px solid ${selectedTransaction.type === 'debit' ? '#fecaca' : '#bbf7d0'}`
                    }}>
                      {selectedTransaction.type === 'debit' ? '📤 Debit' : '📥 Credit'}
                    </span>
                  </div>
                  
                  {/* Amount */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Amount
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      ₹{selectedTransaction.amount?.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Date
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {new Date(selectedTransaction.date || selectedTransaction.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Description
                    </span>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontStyle: selectedTransaction.description ? 'normal' : 'italic'
                    }}>
                      {selectedTransaction.description || 'No description provided'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <button 
                    onClick={handleUpdateClick}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✏️</span>
                    <span>Update</span>
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showConfirmModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Confirm Delete</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none w-8 h-8 flex items-center justify-center"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedTransaction(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-base leading-relaxed text-gray-700">
                  Are you sure you want to delete this{' '}
                  <strong className="text-gray-900">{selectedTransaction.type === 'debit' ? 'debit' : 'credit'}</strong>{' '}
                  transaction of{' '}
                  <strong className="text-gray-900">₹{selectedTransaction.amount?.toLocaleString()}</strong>?
                </p>
                <p className="mb-6 text-sm text-gray-500">
                  This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
                <button className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors" onClick={() => setShowDetailModal(false)}>
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Type</div>
                  <div className={`text-lg font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'credit' ? 'Credit (You Got)' : 'Debit (You Gave)'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Amount</div>
                  <div className={`text-2xl font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(selectedTransaction.amount)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-lg text-gray-800">{selectedTransaction.description || 'NONE'}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Date</div>
                  <div className="text-lg text-gray-800">{formatDate(selectedTransaction.date || selectedTransaction.createdAt)}</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditTransactionModal(selectedTransaction);
                    }}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowConfirmModal(true);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Confirmation Modal */}
        {showConfirmPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Verify Your Password</h2>
                <button 
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowConfirmPasswordModal(false);
                    setConfirmPassword('');
                    setConfirmPasswordError('');
                  }}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">
                    Please enter your account password to view the customer's login credentials.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        verifyAndShowPassword();
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 ${
                      confirmPasswordError ? 'border-red-500' : 'border-gray-200'
                    } rounded-lg text-base transition-all focus:outline-none focus:border-blue-500`}
                    placeholder="Enter your password"
                    autoFocus
                  />
                  {confirmPasswordError && (
                    <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      {confirmPasswordError}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => {
                      setShowConfirmPasswordModal(false);
                      setConfirmPassword('');
                      setConfirmPasswordError('');
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    disabled={verifyingPassword}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={verifyAndShowPassword}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={verifyingPassword}
                  >
                    {verifyingPassword ? 'Verifying...' : 'Verify & Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Bulk Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedTransactions.length} transaction(s)? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setShowBulkDeleteConfirm(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
    </div>
    </Layout>
  );
}

export default CustomerDetail;