import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors['email'] = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors['password'] = 'Password is required';
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
    setMessage('');

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      });

      setLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setMessage(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4 relative overflow-hidden">
      <div className="bg-white/95 backdrop-blur-xl px-10 py-12 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1),0_10px_20px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] w-full max-w-[420px] border border-white/20 relative z-[1]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-[0_8px_20px_rgba(156,202,217,0.4)]">
            👋
          </div>
          <h1 className="text-center mb-10 text-primary-dark text-4xl font-bold">Welcome Back</h1>
          <p className="text-center mb-8 text-gray-600 text-base -mt-6">Sign in to your account to continue</p>
        </div>
        
        {message && (
          <div className="p-4 rounded-xl mb-6 bg-red-100 text-red-700 border border-red-200 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-7 relative">
            <label htmlFor="email" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">📧 Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['email'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(156,202,217,0.2)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your email address"
            />
            {errors['email'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['email']}</div>}
          </div>

          <div className="mb-7 relative">
            <label htmlFor="password" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">🔒 Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['password'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(156,202,217,0.2)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your password"
            />
            {errors['password'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['password']}</div>}
          </div>

          <button 
            type="submit" 
            className="w-full px-6 py-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-primary hover:bg-primary/90 text-primary-dark shadow-[0_4px_15px_rgba(156,202,217,0.4)] hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-8 border-t border-gray-200 text-gray-600 text-[0.95rem]">
          Don't have an account? <Link to="/signup" className="text-[#667eea] no-underline font-semibold transition-colors hover:text-[#5a67d8] hover:underline">Create one here</Link>
        </div>
        

      </div>
    </div>
  );
}

export default Login;