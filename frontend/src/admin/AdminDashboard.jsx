import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API_BASE_URL from '../config/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        {/* <div className="loading-container"> */}
        <div className="min-h-1/2-screen flex flex-col items-center justify-center gap-5">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-800 text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-base">Welcome to SmartHisab Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className="bg-sky-100 rounded-xl p-6 shadow-md border-2 border-[#667eea] cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/admin/users')}
          >
            <h3 className="text-gray-800 text-lg font-semibold mb-3">Total Users</h3>
            <p className="text-gray-900 text-4xl font-bold mb-2">{stats.totalUsers}</p>
            <span className="text-gray-600 text-sm">Click to view all users</span>
          </div>

          <div 
            className="bg-green-100 rounded-xl p-6 shadow-md border-2 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/admin/messages')}
          >
            <h3 className="text-gray-800 text-lg font-semibold mb-3">User Messages</h3>
            <p className="text-gray-900 text-4xl font-bold mb-2">{stats.totalMessages}</p>
            <span className="text-gray-600 text-sm">Click to view messages</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-gray-800 text-lg font-semibold mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col p-4 bg-gray-50 rounded-lg text-center">
              <span className="text-gray-600 text-sm mb-2">Total Messages</span>
              <span className="text-gray-800 text-2xl font-semibold">{stats.totalMessages}</span>
            </div>
            <div className="flex flex-col p-4 bg-gray-50 rounded-lg text-center">
              <span className="text-gray-600 text-sm mb-2">Total Users</span>
              <span className="text-gray-900 text-2xl font-semibold">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;