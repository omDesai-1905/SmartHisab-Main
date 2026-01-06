import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API_BASE_URL from '../config/api';

function AdminUserDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!userDetails) {
    return (
      <AdminLayout>
        <div className="error-container">
          <p>User not found</p>
        </div>
      </AdminLayout>
    );
  }

  const { user, statistics } = userDetails;

  return (
    <AdminLayout>
      <div className="user-details-content">
        <div className="page-header">
          <h1>User Details</h1>
          <p>View detailed information and statistics</p>
        </div>

        {/* User Information Card */}
        <div className="user-info-card">
          <div className="user-header">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-basic-info">
              <h2>{user.name}</h2>
              <p className="user-email">{user.email}</p>
              {user.businessName && (
                <p className="user-business">{user.businessName}</p>
              )}
              {user.mobileNumber && (
                <p className="user-mobile">Phone: {user.mobileNumber}</p>
              )}
              <p className="user-joined">
                Joined: {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {/* Total Customers */}
          <div className="stat-card customers-card">
            <div className="stat-content">
              <h3>Total Customers</h3>
              <p className="stat-number">{statistics.totalCustomers}</p>
              <span className="stat-description">Active customers</span>
            </div>
          </div>

          {/* Total Debit */}
          <div className="stat-card debit-card">
            <div className="stat-content">
              <h3>Total Debit Amount</h3>
              <p className="stat-number">{formatCurrency(statistics.totalDebit)}</p>
              <span className="stat-description">Money owed to customers</span>
            </div>
          </div>

          {/* Total Credit */}
          <div className="stat-card credit-card">
            <div className="stat-content">
              <h3>Total Credit Amount</h3>
              <p className="stat-number">{formatCurrency(statistics.totalCredit)}</p>
              <span className="stat-description">Money owed by customers</span>
            </div>
          </div>

          {/* Net Amount */}
          <div className={`stat-card net-card ${statistics.netAmount >= 0 ? 'positive' : 'negative'}`}>
            <div className="stat-content">
              <h3>Net Amount</h3>
              <p className="stat-number">{formatCurrency(statistics.netAmount)}</p>
              <span className={`net-status ${statistics.netAmount >= 0 ? 'positive' : 'negative'}`}>
                {statistics.netAmount >= 0 ? 'Credit Balance' : 'Debit Balance'}
              </span>
            </div>
          </div>

          {/* Total Income */}
          <div className="stat-card income-card">
            <div className="stat-content">
              <h3>Total Income</h3>
              <p className="stat-number">{formatCurrency(statistics.totalIncome || 0)}</p>
              <span className="stat-description">Total earnings</span>
            </div>
          </div>

          {/* Total Expense */}
          <div className="stat-card expense-card">
            <div className="stat-content">
              <h3>Total Expense</h3>
              <p className="stat-number">{formatCurrency(statistics.totalExpense || 0)}</p>
              <span className="stat-description">Total spending</span>
            </div>
          </div>

          {/* Net Income-Expense */}
          <div className={`stat-card profit-card ${(statistics.netIncomeExpense || 0) >= 0 ? 'positive' : 'negative'}`}>
            <div className="stat-content">
              <h3>Net Profit/Loss</h3>
              <p className="stat-number">{formatCurrency(Math.abs(statistics.netIncomeExpense || 0))}</p>
              <span className={`net-status ${(statistics.netIncomeExpense || 0) >= 0 ? 'positive' : 'negative'}`}>
                {(statistics.netIncomeExpense || 0) >= 0 ? 'Profit' : 'Loss'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-container, .error-container {
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

        .user-details-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .back-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
          width: fit-content;
        }

        .back-btn:hover {
          background: #5a67d8;
        }

        .page-header h1 {
          color: #2d3748;
          font-size: 32px;
          font-weight: 600;
          margin: 0;
        }

        .page-header p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .user-info-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #9CCAD9;
          color: #2F3E46;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-basic-info h2 {
          color: #2d3748;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }

        .user-email {
          color: #4a5568;
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        .user-business {
          color: #667eea;
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }

        .user-mobile {
          color: #718096;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .user-joined {
          color: #a0aec0;
          font-size: 14px;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          transition: transform 0.3s ease;
          border-left: 4px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 32px;
          margin-bottom: 10px;
          display: block;
        }

        .customers-card {
          border: 2px solid #667eea;
        }

        .debit-card {
          border: 2px solid #e53e3e;
        }

        .credit-card {
          border: 2px solid #48bb78;
        }

        .income-card {
          border: 2px solid #38a169;
        }

        .expense-card {
          border: 2px solid #d69e2e;
        }

        .profit-card.positive {
          border: 2px solid #48bb78;
        }

        .profit-card.negative {
          border: 2px solid #e53e3e;
        }

        .net-card.positive {
          border: 2px solid #48bb78;
        }

        .net-card.negative {
          border: 2px solid #e53e3e;
        }

        .stat-content h3 {
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }

        .stat-number {
          color: #1a202c;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .stat-description {
          color: #718096;
          font-size: 14px;
        }

        .net-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .net-status.positive {
          background: rgba(72, 187, 120, 0.1);
          color: #48bb78;
        }

        .net-status.negative {
          background: rgba(229, 62, 62, 0.1);
          color: #e53e3e;
        }

        .summary-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .summary-section h3 {
          color: #2d3748;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #4a5568;
          font-weight: 500;
        }

        .summary-value {
          color: #2d3748;
          font-weight: 600;
        }

        .summary-value.positive {
          color: #48bb78;
        }

        .summary-value.negative {
          color: #e53e3e;
        }

        @media (max-width: 768px) {
          .user-header {
            flex-direction: column;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .summary-item {
            flex-direction: column;
            gap: 5px;
            text-align: center;
          }

          .page-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminUserDetails;
