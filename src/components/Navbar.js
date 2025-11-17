import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FaVideo, FaUser, FaSignOutAlt, FaPlus, FaUsers } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link to="/dashboard" className="navbar-brand">
            <FaVideo style={{ marginRight: '8px' }} />
            VideoCall Pro
          </Link>

          <div className="navbar-nav">
            <Link to="/dashboard" className="navbar-link">
              <FaUser style={{ marginRight: '6px' }} />
              Dashboard
            </Link>
            <Link to="/create-room" className="navbar-link">
              <FaPlus style={{ marginRight: '6px' }} />
              Create Room
            </Link>
            <Link to="/public-rooms" className="navbar-link">
              <FaUsers style={{ marginRight: '6px' }} />
              Browse Rooms
            </Link>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '14px',
                color: isConnected ? '#28a745' : '#dc3545'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#28a745' : '#dc3545',
                  marginRight: '6px'
                }} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>

              <div style={{ 
                fontSize: '14px', 
                color: '#333',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                {user?.username}
              </div>

              <button 
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;