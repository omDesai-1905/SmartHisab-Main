import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children, currentPage = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          currentPage={currentPage}
        />
        
        <div className="flex-1 p-6 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
