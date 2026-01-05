import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors['name'] = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors['email'] = 'Email is invalid';
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors['mobileNumber'] = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.password) {
      newErrors['password'] = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors['password'] = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match';
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

    const result = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim()
    });

    setLoading(false);

    if (result.success) {
      setMessage('Account created successfully! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4 relative overflow-hidden">
      <div className="bg-white/95 backdrop-blur-xl px-10 py-12 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1),0_10px_20px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] w-full max-w-[420px] border border-white/20 relative z-[1]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#7ab4cd] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-[0_8px_20px_rgba(102,126,234,0.3)]">
            🎉
          </div>
          <h1 className="text-center mb-10 text-[#667eea] text-4xl font-bold">Create Account</h1>
          <p className="text-center mb-8 text-gray-600 text-base -mt-6">Join us and start managing your finances</p>
        </div>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-center ${message.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-7 relative">
            <label htmlFor="name" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">👤 Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['name'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1),0_4px_12px_rgba(102,126,234,0.15)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your full name"
            />
            {errors['name'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['name']}</div>}
          </div>

          <div className="mb-7 relative">
            <label htmlFor="email" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">📧 Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['email'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1),0_4px_12px_rgba(102,126,234,0.15)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your email address"
            />
            {errors['email'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['email']}</div>}
          </div>

          <div className="mb-7 relative">
            <label htmlFor="mobileNumber" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">📱 Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['mobileNumber'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1),0_4px_12px_rgba(102,126,234,0.15)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your 10-digit mobile number"
              maxLength={10}
            />
            {errors['mobileNumber'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['mobileNumber']}</div>}
          </div>

          <div className="mb-7 relative">
            <label htmlFor="password" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">🔒 Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['password'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1),0_4px_12px_rgba(102,126,234,0.15)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Enter your password (6+ characters)"
            />
            {errors['password'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['password']}</div>}
          </div>

          <div className="mb-7 relative">
            <label htmlFor="confirmPassword" className="block mb-2.5 text-gray-700 font-semibold text-sm uppercase tracking-wide">🔐 Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-5 py-4 border-2 ${errors['confirmPassword'] ? 'border-red-500 shadow-[0_0_0_4px_rgba(229,62,62,0.1)]' : 'border-gray-200'} rounded-xl text-base transition-all bg-white/80 backdrop-blur-sm focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1),0_4px_12px_rgba(102,126,234,0.15)] focus:-translate-y-px focus:bg-white/95 placeholder:text-gray-400`}
              placeholder="Confirm your password"
            />
            {errors['confirmPassword'] && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 before:content-['⚠️'] before:text-xs">{errors['confirmPassword']}</div>}
          </div>

          <button 
            type="submit" 
            className="w-full px-6 py-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-[#7ab4cd] text-white shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:bg-[#89b1c2] hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-8 border-t border-gray-200 text-gray-600 text-[0.95rem]">
          Already have an account? <Link to="/login" className="text-[#667eea] no-underline font-semibold transition-colors hover:text-[#5a67d8] hover:underline">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;