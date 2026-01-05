import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setAdmin(data.admin);
        } else {
          localStorage.removeItem('adminToken');
        }
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    adminLogin,
    adminLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
