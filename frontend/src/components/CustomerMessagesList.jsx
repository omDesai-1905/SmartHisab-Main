import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";

const CustomerMessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/user/customer-messages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (messageId, newStatus) => {
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        `/api/user/customer-messages/${messageId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMessages();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <Layout currentPage="/customer-messages">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: '#f5f7fa' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4b5563' }}>Loading messages...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/customer-messages">
    <div style={{ padding: '2rem', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
          Customer Messages
        </h2>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          View and manage customer inquiries and complaints
        </p>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.5rem' }}>No messages found</p>
          <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
            Customer messages will appear here
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '1.5rem' 
        }}>
          {messages.map((msg) => (
            <div
              key={msg._id}
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '2rem',
                transition: 'all 0.3s',
                border: '1px solid #f3f4f6'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Message Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.75rem' }}>
                    {msg.subject}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                      <span>👤</span> {msg.customerName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>📅</span> {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>🕒</span> {new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '8px',
                      fontWeight: '700',
                      background: msg.type === 'complaint' ? '#fee2e2' : msg.type === 'dispute' ? '#fed7aa' : '#dbeafe',
                      color: msg.type === 'complaint' ? '#991b1b' : msg.type === 'dispute' ? '#9a3412' : '#1e40af',
                      border: msg.type === 'complaint' ? '2px solid #fecaca' : msg.type === 'dispute' ? '2px solid #fdba74' : '2px solid #bfdbfe'
                    }}
                  >
                    {msg.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '8px',
                      fontWeight: '700',
                      background: msg.status === 'resolved' ? '#d1fae5' : msg.status === 'in-progress' ? '#fef3c7' : '#f3f4f6',
                      color: msg.status === 'resolved' ? '#065f46' : msg.status === 'in-progress' ? '#92400e' : '#374151'
                    }}
                  >
                    {msg.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                <p style={{ fontSize: '1rem', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>
                  {msg.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleUpdateStatus(msg._id, "in-progress")}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  <span>⏳</span> Mark In Progress
                </button>
                
                <button
                  onClick={() => handleUpdateStatus(msg._id, "resolved")}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <span>✓</span> Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
};

export default CustomerMessagesList;
