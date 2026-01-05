import React from 'react';

function Notification({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`fixed top-6 right-6 z-[9999] min-w-[300px] max-w-[500px] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-[slideIn_0.3s_ease] ${
      notification.type === 'success' 
        ? 'bg-emerald-50 border-l-4 border-emerald-500' 
        : notification.type === 'error' 
        ? 'bg-red-50 border-l-4 border-red-500' 
        : 'bg-primary/10 border-l-4 border-primary'
    }`}>
      <div className="text-2xl">
        {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
      </div>
      <span className={`flex-1 font-medium ${
        notification.type === 'success' 
          ? 'text-emerald-800' 
          : notification.type === 'error' 
          ? 'text-red-800' 
          : 'text-primary-dark'
      }`}>{notification.message}</span>
      <button 
        className="text-3xl text-gray-400 hover:text-gray-600 leading-none transition-colors ml-auto" 
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default Notification;
