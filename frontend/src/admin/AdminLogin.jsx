import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await adminLogin(formData.email, formData.password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-gray-800 mb-3 text-3xl font-semibold">Admin Login</h2>
          <p className="text-gray-600 text-sm">Access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errors.general && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-medium text-gray-800 text-sm">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter admin email"
              disabled={isLoading}
            />
            {errors.email && <span className="text-red-600 text-xs mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 font-medium text-gray-800 text-sm">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
              disabled={isLoading}
            />
            {errors.password && <span className="text-red-600 text-xs mt-1">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-primary-dark border-none py-3 px-5 rounded-lg text-base font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-transparent border-none text-primary-dark cursor-pointer underline text-sm hover:text-primary"
            >
              Back to User Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
