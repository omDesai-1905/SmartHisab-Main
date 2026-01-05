import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            {onToggleSidebar && (
              <button 
                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors border bg-gray-200"
                onClick={onToggleSidebar}
              >
                ☰
              </button>
            )}
            <div className="font-['Georgia','Times_New_Roman',serif] font-bold text-2xl text-sky-700 drop-shadow-sm tracking-wide">
              SmartHisab
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-gray-700">Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;