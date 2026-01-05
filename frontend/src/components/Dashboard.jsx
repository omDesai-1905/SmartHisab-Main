import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCustomerForm = () => {
    const newErrors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (newCustomer.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(newCustomer.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCustomerForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post('/api/customers', {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim()
        });

        setCustomers(prev => [...prev, { ...response.data, balance: 0 }]);
        
      } else {
        response = await axios.post(`/api/customers/${selectedCustomer._id}`, {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim()
        });

        setCustomers(prev => prev.map(customer => 
          customer._id === selectedCustomer._id 
            ? { ...customer, ...response.data }
            : customer
        ));
      }

      setNewCustomer({ name: '', phone: '' });
      setSelectedCustomer(null);
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrors({ submit: error.response?.data?.message || `Failed to ${modalType} customer` });
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setNewCustomer({ name: '', phone: '' });
    setSelectedCustomer(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (customer, e) => {
    e.stopPropagation(); 
    setModalType('edit');
    setSelectedCustomer(customer);
    setNewCustomer({ name: customer.name, phone: customer.phone });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customer, e) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
    setShowConfirmModal(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      await axios.delete(`/api/customers/${customerToDelete._id}`);

      setCustomers(prev => prev.filter(c => c._id !== customerToDelete._id));

      setShowConfirmModal(false);
      setCustomerToDelete(null);

      showNotification(`Customer "${customerToDelete.name}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showNotification('Failed to delete customer. Please try again.', 'error');
    }
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customer/${customerId}`);
  };

  const formatBalance = (balance) => {
    const absBalance = Math.abs(balance);
    return `₹${absBalance.toLocaleString()}`;
  };

  const getBalanceClass = (balance) => {
    if (balance > 0) return 'balance-positive';
    if (balance < 0) return 'balance-negative';
    return '';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return 'You will give';
    if (balance < 0) return 'You will get';
    return 'No balance';
  };

  if (loading) {
    return (
      <Layout currentPage="/dashboard">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 text-gray-600">Loading customers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Customer List</h1>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate('/analytics')}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark rounded-lg font-medium border-none flex items-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md"
            >
               View Analytics
            </button>
            <button 
              onClick={openAddModal}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark rounded-lg font-medium border-none flex items-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md"
            >
              + Add New Customer
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl mb-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Customers
          </label>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(156,202,217,0.2)]"
          />
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center text-gray-500 py-8">
              No customers found. Add your first customer to get started!
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {searchTerm && (
              <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                {filteredCustomers.length === 0 
                  ? `No customers found matching "${searchTerm}"` 
                  : `Found ${filteredCustomers.length} customer(s) matching "${searchTerm}"`
                }
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Balance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? filteredCustomers : customers).map((customer) => (
                    <tr 
                      key={customer._id} 
                      onClick={() => handleCustomerClick(customer._id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">{customer.name}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                      <td className={`px-6 py-4 font-semibold ${customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatBalance(customer.balance)}
                      </td>
                      <td className={`px-6 py-4 font-medium ${customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {getBalanceText(customer.balance)}
                      </td>
                      <td className="px-6 py-4 w-[120px]">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => openEditModal(customer, e)}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteCustomer(customer, e)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalType === 'add' ? 'Add New Customer' : 'Edit Customer'}
                </h2>
                <button 
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setNewCustomer({ name: '', phone: '' });
                    setSelectedCustomer(null);
                    setErrors({});
                  }}
                >
                  ×
                </button>
              </div>

              {errors.submit && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleCustomerSubmit} className="p-6">
                <div className="mb-6">
                  <label htmlFor="customerName" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">Customer Name</label>
                  <input
                    type="text"
                    id="customerName"
                    value={newCustomer.name}
                    onChange={(e) => {
                      setNewCustomer(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full px-5 py-4 border-2 ${errors.name ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(156,202,217,0.15)] placeholder:text-gray-400`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors.name}</div>}
                </div>

                <div className="mb-6">
                  <label htmlFor="customerPhone" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      setNewCustomer(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full px-5 py-4 border-2 ${errors.phone ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(156,202,217,0.15)] placeholder:text-gray-400`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors.phone}</div>}
                </div>

                <div className="flex gap-4 justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewCustomer({ name: '', phone: '' });
                      setSelectedCustomer(null);
                      setErrors({});
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (modalType === 'add' ? 'Adding...' : 'Updating...') : (modalType === 'add' ? 'Add Customer' : 'Update Customer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && customerToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl max-w-[400px] w-full shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Confirm Delete</h2>
                <button 
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setCustomerToDelete(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-base leading-relaxed text-gray-700">
                  Are you sure you want to delete customer{' '}
                  <strong>"{customerToDelete.name}"</strong>?
                </p>
                <p className="mb-6 text-gray-500 text-sm">
                  This will also delete all transactions for this customer. This action cannot be undone.
                </p>

                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false);
                      setCustomerToDelete(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteCustomer}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </Layout>
  );
}

export default Dashboard;