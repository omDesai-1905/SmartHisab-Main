import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    businessName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        businessName: user.businessName || ''
      });
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors['name'] = 'Name must be at least 2 characters';
    }

    // Validate mobile number (optional but if provided should be valid)
    if (formData.mobileNumber && formData.mobileNumber.trim()) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobileNumber.trim())) {
        newErrors['mobileNumber'] = 'Please enter a valid 10-digit mobile number';
      }
    }

    // Validate business name (optional but if provided should be valid)
    if (formData.businessName && formData.businessName.trim().length < 2) {
      newErrors['businessName'] = 'Business name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        businessName: formData.businessName.trim()
      };

      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update user context
      updateUser(response.data.user);
      
      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      businessName: user.businessName || ''
    });
    setErrors({});
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete('/api/auth/delete-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear all local storage and logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      
      setNotification({
        type: 'success',
        message: 'Account deleted successfully'
      });

      // Redirect to signup page after a short delay
      setTimeout(() => {
        navigate('/signup');
      }, 2000);

    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete account'
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  if (!user) {
    return (
      <Layout currentPage="/profile">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 text-lg">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/profile">
      {/* Custom Notification Toast */}
      {notification && (
        <div 
          className="fixed top-6 right-6 z-[9999] min-w-[300px] animate-[slideIn_0.3s_ease]"
        >
          <div className={`p-4 rounded-lg shadow-lg text-white font-medium flex items-center justify-between ${
            notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-primary'
          }`}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white text-xl opacity-80 hover:opacity-100 bg-transparent border-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-5xl text-primary-dark">
            {user.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">👤 Full Name</label>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">📱 Mobile Number</label>
                    <p className="text-lg text-gray-900">{user.mobileNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">📅 Member Since</label>
                    <p className="text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">📧 Email Address</label>
                    <p className="text-lg text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">🏢 Business Name</label>
                    <p className="text-lg text-gray-900">{user.businessName || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 justify-center">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors"
                >
                  ✏️ Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  🚪 Logout
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-red-600 font-medium rounded-lg transition-colors border border-red-300"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">👤 Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors['name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors['name'] && <div className="text-red-600 text-sm mt-1">{errors['name']}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">📧 Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Email address"
                    readOnly
                  />
                  <small className="text-gray-500 text-sm">Email cannot be changed</small>
                </div>

                <div className="mb-4">
                  <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">📱 Mobile Number</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors['mobileNumber'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your 10-digit mobile number"
                    maxLength="10"
                  />
                  {errors['mobileNumber'] && <div className="text-red-600 text-sm mt-1">{errors['mobileNumber']}</div>}
                </div>

                <div className="mb-6">
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">🏢 Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors['businessName'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your business name (optional)"
                  />
                  {errors['businessName'] && <div className="text-red-600 text-sm mt-1">{errors['businessName']}</div>}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Delete Account</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete your account? This will permanently delete all your data including customers, transactions, and cashbook entries. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Profile;