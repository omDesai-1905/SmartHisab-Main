import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Set the authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify the token with the server
          const response = await axios.get('/api/auth/verify');
          
          if (response.data.valid) {
            setUser(JSON.parse(userData));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // Token verification failed, clear storage
          console.error('Token verification failed:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    verifyToken();
  }, []);

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    signup,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}