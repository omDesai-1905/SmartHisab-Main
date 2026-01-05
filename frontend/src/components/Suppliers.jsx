import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
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

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showNotification('Failed to fetch suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateSupplierForm = () => {
    const newErrors = {};

    if (!newSupplier.name.trim()) {
      newErrors.name = 'Supplier name is required';
    } else if (newSupplier.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!newSupplier.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(newSupplier.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSupplierForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post('/api/suppliers', {
          name: newSupplier.name.trim(),
          phone: newSupplier.phone.trim()
        });

        setSuppliers(prev => [...prev, { ...response.data, balance: 0 }]);
        showNotification('Supplier added successfully');
        
      } else {
        response = await axios.post(`/api/suppliers/${selectedSupplier._id}`, {
          name: newSupplier.name.trim(),
          phone: newSupplier.phone.trim()
        });

        setSuppliers(prev => prev.map(supplier => 
          supplier._id === selectedSupplier._id 
            ? { ...supplier, name: newSupplier.name.trim(), phone: newSupplier.phone.trim() }
            : supplier
        ));
        showNotification('Supplier updated successfully');
      }

      setShowModal(false);
      setNewSupplier({ name: '', phone: '' });
      setErrors({});
      setSelectedSupplier(null);
      
    } catch (error) {
      console.error('Error saving supplier:', error);
      showNotification(error.response?.data?.message || 'Failed to save supplier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier({ 
      name: supplier.name, 
      phone: supplier.phone 
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/suppliers/${supplierToDelete._id}`);
      setSuppliers(prev => prev.filter(s => s._id !== supplierToDelete._id));
      showNotification('Supplier deleted successfully');
      setShowConfirmModal(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showNotification('Failed to delete supplier', 'error');
    }
  };

  const handleSupplierClick = (supplierId) => {
    navigate(`/suppliers/${supplierId}`);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Layout currentPage="/suppliers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Suppliers</h1>
            <p className="text-gray-600">Manage your suppliers</p>
          </div>
          <button 
            onClick={() => {
              setModalType('add');
              setNewSupplier({ name: '', phone: '' });
              setErrors({});
              setShowModal(true);
            }}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors shadow-sm"
          >
            + Add Supplier
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Suppliers
          </label>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No suppliers yet</h3>
              <p className="text-gray-600">Add your first supplier to get started</p>
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
                  {filteredSuppliers.length === 0 
                    ? `No suppliers found matching "${searchTerm}"` 
                    : `Found ${filteredSuppliers.length} supplier(s) matching "${searchTerm}"`
                  }
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Supplier Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Balance</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchTerm ? filteredSuppliers : suppliers).map((supplier) => (
                      <tr 
                        key={supplier._id} 
                        onClick={() => handleSupplierClick(supplier._id)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">{supplier.name}</td>
                        <td className="px-6 py-4 text-gray-600">{supplier.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            supplier.balance > 0 ? 'text-red-600' : 
                            supplier.balance < 0 ? 'text-green-600' : 
                            'text-gray-600'
                          }`}>
                            {formatAmount(Math.abs(supplier.balance))}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${
                            supplier.balance > 0 
                              ? 'text-red-700' 
                              : supplier.balance < 0 
                                ? 'text-green-700' 
                                : 'text-gray-700'
                          }`}>
                            {supplier.balance > 0 ? 'You Owe' : supplier.balance < 0 ? 'They Owe' : 'Settled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSupplier(supplier);
                              }}
                              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-dark text-xs font-medium rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSupplier(supplier);
                              }}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors"
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
            </>
          )}
        </div>

        {/* Add/Edit Supplier Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalType === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
                </h2>
                <button 
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setNewSupplier({ name: '', phone: '' });
                    setErrors({});
                    setSelectedSupplier(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSupplierSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter supplier name"
                      value={newSupplier.name}
                      onChange={(e) => {
                        setNewSupplier({ ...newSupplier, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-primary/20 outline-none transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={newSupplier.phone}
                      onChange={(e) => {
                        setNewSupplier({ ...newSupplier, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-primary/20 outline-none transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewSupplier({ name: '', phone: '' });
                      setErrors({});
                      setSelectedSupplier(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : modalType === 'add' ? 'Add Supplier' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Supplier</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{supplierToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSupplierToDelete(null);
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

        {/* Notification */}
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
      </div>
    </Layout>
  );
}

export default Suppliers;
