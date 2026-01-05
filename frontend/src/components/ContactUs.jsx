import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

function ContactUs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    emailAddress: '',
    topic: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        emailAddress: user.email || ''
      }));
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

    // Validate email address
    if (!formData.emailAddress || !formData.emailAddress.trim()) {
      newErrors['emailAddress'] = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress.trim())) {
        newErrors['emailAddress'] = 'Please enter a valid email address';
      }
    }

    // Validate topic
    if (!formData.topic || formData.topic.trim().length < 3) {
      newErrors['topic'] = 'Topic must be at least 3 characters';
    }

    // Validate description
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors['description'] = 'Description must be at least 10 characters';
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
      showNotification('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailAddress: formData.emailAddress.trim(),
          topic: formData.topic.trim(),
          description: formData.description.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Message sent successfully! Admin will review it soon.', 'success');
        
        // Reset form after successful submission
        setFormData({
          emailAddress: user?.email || '',
          topic: '',
          description: ''
        });
      } else {
        showNotification(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Network error occurred. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout currentPage="/contact">
      {/* Notification */}
      {notification && (
        <div 
          className={`fixed top-6 right-6 z-[9999] min-w-[300px] p-4 rounded-lg shadow-lg text-white font-medium flex items-center justify-between animate-[slideIn_0.3s_ease] ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-white text-xl opacity-80 hover:opacity-100 bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-primary-dark">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            We're here to help! Send us your questions, feedback, or suggestions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="emailAddress" className="block text-sm font-semibold text-gray-700 mb-2">Your Email Address</label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.emailAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                required
              />
              {errors.emailAddress && <div className="text-red-600 text-sm mt-1">{errors.emailAddress}</div>}
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">Topic/Subject</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.topic ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter the topic or subject of your message"
                required
              />
              {errors.topic && <div className="text-red-600 text-sm mt-1">{errors.topic}</div>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y min-h-[150px] ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your question, feedback, suggestion, or issue in detail..."
                rows="6"
                required
              />
              {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
              <small className="text-gray-500 text-sm mt-1 block">
                Please provide as much detail as possible to help us assist you better.
              </small>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                type="submit"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ContactUs;
