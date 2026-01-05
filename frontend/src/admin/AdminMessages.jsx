import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data.map(msg => ({ id: msg._id, isRead: msg.isRead, topic: msg.topic })));
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId, event) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the message click
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAsUnread = async (messageId, event) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the message click
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/messages/${messageId}/unread`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: false } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as unread:', error);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="messages-content">
        <div className="page-header">
          <h1>User Messages ({messages.length})</h1>
          <p>View and manage all user support messages</p>
        </div>

        {/* Search */}
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="messages-container">
          {filteredMessages.length === 0 ? (
            <div className="no-messages">
              <p>No messages found matching your criteria.</p>
            </div>
          ) : (
            <div className="messages-list">
              {filteredMessages.map(message => (
                <div 
                  key={message._id}
                  className="message-card"
                  onClick={() => handleViewMessage(message)}
                >
                  {/* Status Indicator */}
                  <div className="status-indicator">
                    {message.isRead ? (
                      <span className="status-icon read-icon">✅</span>
                    ) : (
                      <span className="status-icon unread-icon">❌</span>
                    )}
                  </div>
                  
                  <div className="message-header">
                    <div className="message-user">
                      <div className="user-avatar">
                        {message.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h4>{message.userId.name}</h4>
                        <p>{message.userId.email}</p>
                        {message.userId.businessName && (
                          <p className="business-name">{message.userId.businessName}</p>
                        )}
                      </div>
                    </div>
                    <div className="message-meta">
                      <span className="message-date">
                        {new Date(message.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      <div className="status-buttons">
                        <button
                          className={`status-btn read-btn ${message.isRead ? 'active' : ''}`}
                          onClick={(e) => markAsRead(message._id, e)}
                          title="Mark as read"
                        >
                          Read
                        </button>
                        <button
                          className={`status-btn unread-btn ${!message.isRead ? 'active' : ''}`}
                          onClick={(e) => markAsUnread(message._id, e)}
                          title="Mark as unread"
                        >
                          Unread
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="message-content">
                    <h5>{message.topic}</h5>
                    <p className="message-preview">
                      {message.description.length > 100 
                        ? `${message.description.substring(0, 100)}...` 
                        : message.description
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedMessage(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="message-full-header">
                <div className="user-full-info">
                  <div className="user-avatar large">
                    {selectedMessage.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h4>{selectedMessage.userId.name}</h4>
                    <p>{selectedMessage.userId.email}</p>
                    {selectedMessage.userId.mobileNumber && (
                      <p>Phone: {selectedMessage.userId.mobileNumber}</p>
                    )}
                    {selectedMessage.userId.businessName && (
                      <p className="business-name">Business: {selectedMessage.userId.businessName}</p>
                    )}
                    <p className="joined-date">
                      Joined: {new Date(selectedMessage.userId.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="message-timestamp">
                  <p>Sent on {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="message-full-content">
                <h4>Subject: {selectedMessage.topic}</h4>
                <div className="message-text">
                  {selectedMessage.description.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        .messages-content {
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

        .controls-section {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .search-container {
          position: relative;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 8px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .messages-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          overflow: hidden;
        }

        .no-messages {
          padding: 60px 20px;
          text-align: center;
          color: #718096;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
        }

        .message-card {
          position: relative;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .status-indicator {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 10;
        }

        .status-icon {
          font-size: 18px;
          display: inline-block;
        }

        .read-icon {
          filter: brightness(0.9);
        }

        .unread-icon {
          filter: brightness(0.9);
        }

        .message-card:last-child {
          border-bottom: none;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .message-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #8CCAD2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-avatar.large {
          width: 60px;
          height: 60px;
          font-size: 24px;
        }

        .user-info h4 {
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 3px 0;
        }

        .user-info p {
          color: #4a5568;
          font-size: 14px;
          margin: 0 0 2px 0;
        }

        .business-name {
          color: #667eea !important;
          font-weight: 500 !important;
        }

        .message-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .message-date {
          color: #a0aec0;
          font-size: 12px;
        }

        .status-buttons {
          display: flex;
          gap: 8px;
        }

        .status-btn {
          padding: 4px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .status-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .read-btn {
          color: #68d391;
          border-color: #68d391;
        }

        .read-btn.active {
          background: #68d391;
          color: white;
        }

        .read-btn:hover {
          background: #48bb78;
          color: white;
          border-color: #48bb78;
        }

        .unread-btn {
          color: #fc8181;
          border-color: #fc8181;
        }

        .unread-btn.active {
          background: #fc8181;
          color: white;
        }

        .unread-btn:hover {
          background: #e53e3e;
          color: white;
          border-color: #e53e3e;
        }
        }

        .message-content h5 {
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .message-preview {
          color: #718096;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          color: #2d3748;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #a0aec0;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #718096;
        }

        .modal-body {
          padding: 25px;
        }

        .message-full-header {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .user-full-info {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 15px;
        }

        .user-details h4 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .user-details p {
          color: #4a5568;
          font-size: 14px;
          margin: 0 0 3px 0;
        }

        .joined-date {
          color: #a0aec0 !important;
          font-size: 12px !important;
        }

        .message-timestamp p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .message-full-content h4 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 15px 0;
        }

        .message-text p {
          color: #4a5568;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 10px 0;
        }

        .message-text p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .controls-section {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .search-container {
            max-width: 100%;
          }

          .message-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .message-user {
            flex-direction: column;
            text-align: center;
          }

          .user-full-info {
            flex-direction: column;
            text-align: center;
          }

          .modal-content {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }

          .page-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminMessages;
