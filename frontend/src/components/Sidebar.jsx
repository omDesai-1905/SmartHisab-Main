import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, onClose, currentPage = '' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏢' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/cashbook', label: 'Cashbook', icon: '📖' },
    { path: '/customer-messages', label: 'Customer Messages', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/contact', label: 'Contact Us', icon: '📞' }
  ];

  return (
    <>
      <div className={`fixed top-0 left-0 h-full w-[85vw] sm:w-[280px] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 z-[100] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary font-bold" style={{fontSize: '1.5rem' }} >SmartHisab</h3>
          <button className="text-3xl text-gray-600 hover:text-gray-800 leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="flex flex-col h-full pt-6 lg:pt-4">
          <div className="flex-1 px-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`w-full text-left px-4 py-3.5 rounded-lg mb-2 font-medium transition-all flex items-center gap-3 ${
                  currentPage === item.path 
                    ? 'bg-primary text-primary-dark shadow-md' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            
            <button className="w-full text-left px-4 py-3.5 rounded-lg mb-2 font-medium transition-all flex items-center gap-3 bg-transparent text-red-600 hover:bg-red-50 mt-4" onClick={handleLogout}>
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>

          <div className="border-t border-gray-200 p-4 mt-auto">
            <div className="flex flex-col">
              <strong className="text-gray-800 mb-1">{user?.name}</strong>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99]" onClick={onClose} />
      )}
    </>
  );
}

export default Sidebar;
