import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Notification from './Notification';
import TransactionModal from './TransactionModal';
import axios from 'axios';

function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('debit');
  const [newTransaction, setNewTransaction] = useState({ 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState(null);

  useEffect(() => {
    fetchSupplierData();
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
      const totalCount = selectedTransactions.length;
      
      // Process deletions in batches of 5 to avoid overwhelming the backend
      const batchSize = 5;
      const results = [];
      let completedCount = 0;
      
      // Show initial progress
      setDeletionProgress({ completed: 0, total: totalCount });
      
      for (let i = 0; i < selectedTransactions.length; i += batchSize) {
        const batch = selectedTransactions.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(transactionId =>
            axios.delete(`/api/suppliers/${id}/transactions/${transactionId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        results.push(...batchResults);
        
        // Update progress after each batch
        completedCount += batch.length;
        setDeletionProgress({ completed: completedCount, total: totalCount });
      }
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      // Wait a moment for backend to complete all operations
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data from server to ensure UI is in sync
      await fetchSupplierData();
      
      // Clear progress
      setDeletionProgress(null);
      
      if (failCount === 0) {
        showNotification(`Successfully deleted ${successCount} transaction(s)`);
      } else if (successCount === 0) {
        showNotification('Failed to delete transactions', 'error');
      } else {
        showNotification(`Deleted ${successCount} transaction(s), ${failCount} failed`, 'warning');
      }
      
      setSelectedTransactions([]);
      setSelectionMode(false);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      setDeletionProgress(null);
      showNotification('Failed to delete transactions', 'error');
      // Still refresh to ensure UI is in sync
      await fetchSupplierData();
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`/api/suppliers/${id}/transactions`);
      setSupplier(response.data.supplier);

      const sortedTransactions = response.data.transactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
      });
      
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      if (error.response?.status === 404) {
        navigate('/suppliers');
      }
      showNotification('Failed to fetch supplier data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (formData) => {
    setSubmitting(true);

    try {
      let response;
      const description = formData.description.trim() || 'NONE';
      const amount = parseFloat(formData.amount);
      
      if (modalType === 'add') {
        response = await axios.post(`/api/suppliers/${id}/transactions`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: formData.date
        });

        setTransactions(prev => {
          const newTransactions = [response.data, ...prev];
          return newTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA;
          });
        });
        showNotification('Transaction added successfully');
      } else {
        response = await axios.put(`/api/suppliers/${id}/transactions/${selectedTransaction._id}`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: formData.date
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
            return dateB - dateA;
          });
        });
        showNotification('Transaction updated successfully');
      }
      
      fetchSupplierData();
      setNewTransaction({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setSelectedTransaction(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification(error.response?.data?.message || 'Failed to save transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewTransaction({ 
      amount: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setSelectedTransaction(null);
  };

  const openTransactionModal = (type) => {
    setModalType('add');
    setTransactionType(type);
    setNewTransaction({ 
      amount: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setShowModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType('edit');
    setTransactionType(transaction.type);
    setNewTransaction({
      amount: transaction.amount.toString(),
      description: transaction.description === 'NONE' ? '' : transaction.description,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/suppliers/${id}/transactions/${selectedTransaction._id}`);
      setTransactions(prev => prev.filter(t => t._id !== selectedTransaction._id));
      fetchSupplierData();
      showNotification('Transaction deleted successfully');
      setShowConfirmModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Failed to delete transaction', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotals = () => {
    const totalDebit = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCredit = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit
    };
  };

  if (loading) {
    return (
      <Layout currentPage="/suppliers">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!supplier) {
    return (
      <Layout currentPage="/suppliers">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Supplier not found</div>
        </div>
      </Layout>
    );
  }

  const { totalDebit, totalCredit, balance } = calculateTotals();

  return (
    <Layout currentPage="/suppliers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header and Supplier Info */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/suppliers')}
            className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2 w-fit"
          >
            ← Back to Suppliers
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{supplier.name}</h1>
            <p className="text-gray-600">{supplier.phone}</p>
          </div>
        </div>

        {/* Summary without boxes */}
        <div className="mb-6 text-lg">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Total Debit: </span>
            <span className="font-bold text-red-600">{formatAmount(totalDebit)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Total Credit: </span>
            <span className="font-bold text-green-600">{formatAmount(totalCredit)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Balance (Debit - Credit): </span>
            <span className={`font-bold ${
              balance > 0 ? 'text-red-600' :
              balance < 0 ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {formatAmount(Math.abs(balance))}
            </span>
            <span className="text-sm font-medium text-gray-600 ml-2">
              {balance > 0 ? '(You Owe)' : balance < 0 ? '(They Owe)' : '(Settled)'}
            </span>
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Add your first transaction to get started</p>
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
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
        <TransactionModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialData={newTransaction}
          type={transactionType}
          mode={modalType}
          context="supplier"
          submitting={submitting}
        />

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

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Transaction</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
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
        
        {/* Deletion Progress Indicator */}
        {deletionProgress && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-[1002] flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="font-medium">
              Deleting {deletionProgress.completed} of {deletionProgress.total} transactions...
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SupplierDetail;
