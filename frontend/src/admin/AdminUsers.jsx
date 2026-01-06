import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API_BASE_URL from '../config/api';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="users-content">
        <div className="page-header">
          <h1>All Users ({users.length})</h1>
          <p>Manage and view all registered users</p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users by name, email, or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-grid">
          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <p>No users found matching your search.</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div 
                key={user._id}
                className="user-card"
                onClick={() => navigate(`/admin/users/${user._id}`)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                  {user.businessName && (
                    <p className="user-business">{user.businessName}</p>
                  )}
                  {user.mobileNumber && (
                    <p className="user-mobile">{user.mobileNumber}</p>
                  )}
                  <p className="user-date">
                    Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="user-arrow">
                  →
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .users-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          color: #2d3748;
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }

        .page-header p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .search-section {
          margin-bottom: 30px;
        }

        .search-container {
          position: relative;
          max-width: 500px;
        }

        .search-input {
          width: 100%;
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .no-users {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .user-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 2px solid transparent;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #9CCAD9;
          color: #2F3E46;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
        }

        .user-info h3 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .user-email {
          color: #4a5568;
          font-size: 14px;
          margin: 0 0 3px 0;
        }

        .user-business {
          color: #667eea;
          font-size: 14px;
          margin: 0 0 3px 0;
          font-weight: 500;
        }

        .user-mobile {
          color: #718096;
          font-size: 14px;
          margin: 0 0 5px 0;
        }

        .user-date {
          color: #a0aec0;
          font-size: 12px;
          margin: 0;
        }

        .user-arrow {
          color: #a0aec0;
          transition: color 0.3s ease;
          font-size: 20px;
          font-weight: bold;
        }

        .user-card:hover .user-arrow {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }

          .user-card {
            flex-direction: column;
            text-align: center;
          }

          .user-arrow {
            transform: rotate(90deg);
          }

          .page-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminUsers;
