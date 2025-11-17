import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaPlus, 
  FaVideo, 
  FaUsers, 
  FaCalendarAlt, 
  FaExternalLinkAlt,
  FaTrash,
  FaEdit,
  FaSignOutAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalRooms: 0,
    totalParticipants: 0,
    activeRooms: 0
  });

  const { user } = useAuth();
  const { joinRoom } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserRooms();
  }, []);

  const loadUserRooms = async () => {
    try {
      const response = await api.get('/rooms/my-rooms');
      const userRooms = response.data.rooms;
      
      setRooms(userRooms);
      
      // Calculate stats
      const stats = {
        totalRooms: userRooms.length,
        totalParticipants: userRooms.reduce((sum, room) => sum + room.participants, 0),
        activeRooms: userRooms.filter(room => room.isActive).length
      };
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load your rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const success = await joinRoom(roomId, user.username);
      if (success) {
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms(rooms.filter(room => room.roomId !== roomId));
      toast.success('Room deleted successfully');
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        totalRooms: prev.totalRooms - 1,
        activeRooms: prev.activeRooms - 1
      }));
      
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const copyRoomLink = (roomId) => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Room link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '60px' }}>
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '60px', marginBottom: '60px' }}>
      {/* Welcome Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '16px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              Welcome back, {user?.username}! 👋
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Manage your video call rooms and stay connected
            </p>
          </div>
          <Link to="/create-room" className="btn btn-light" style={{ 
            fontSize: '16px',
            padding: '12px 24px',
            fontWeight: '600'
          }}>
            <FaPlus style={{ marginRight: '8px' }} />
            Create New Room
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row" style={{ marginBottom: '40px' }}>
        <div className="col-md-4">
          <div className="card" style={{ textAlign: 'center' }}>
            <FaVideo style={{ fontSize: '32px', color: '#007bff', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {userStats.totalRooms}
            </h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Total Rooms</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card" style={{ textAlign: 'center' }}>
            <FaUsers style={{ fontSize: '32px', color: '#28a745', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {userStats.totalParticipants}
            </h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Total Participants</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card" style={{ textAlign: 'center' }}>
            <FaCalendarAlt style={{ fontSize: '32px', color: '#6f42c1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {userStats.activeRooms}
            </h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Active Rooms</p>
          </div>
        </div>
      </div>

      {/* My Rooms Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600' }}>My Rooms</h2>
          <Link to="/create-room" className="btn btn-primary">
            <FaPlus style={{ marginRight: '8px' }} />
            Create Room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaVideo style={{ fontSize: '64px', color: '#dee2e6', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              No rooms yet
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '32px' }}>
              Create your first video call room to get started
            </p>
            <Link to="/create-room" className="btn btn-primary btn-lg">
              <FaPlus style={{ marginRight: '8px' }} />
              Create Your First Room
            </Link>
          </div>
        ) : (
          <div className="row">
            {rooms.map((room) => (
              <div key={room.roomId} className="col-md-6 col-lg-4">
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', margin: 0, flex: 1 }}>
                        {room.name}
                      </h4>
                      <div style={{ 
                        padding: '4px 8px', 
                        backgroundColor: room.isActive ? '#d4edda' : '#f8d7da',
                        color: room.isActive ? '#155724' : '#721c24',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {room.description && (
                      <p style={{ color: '#6c757d', marginBottom: '16px', fontSize: '14px' }}>
                        {room.description}
                      </p>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#6c757d' }}>Participants:</span>
                        <span style={{ fontWeight: '500' }}>
                          {room.participants}/{room.maxParticipants}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#6c757d' }}>Created:</span>
                        <span>{formatDate(room.createdAt)}</span>
                      </div>
                    </div>

                    {room.isPublic && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#e7f3ff',
                        color: '#004085',
                        borderRadius: '8px',
                        fontSize: '12px',
                        marginBottom: '16px'
                      }}>
                        🔓 Public Room - Anyone can join
                      </div>
                    )}

                    {!room.isPublic && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        borderRadius: '8px',
                        fontSize: '12px',
                        marginBottom: '16px'
                      }}>
                        🔒 Private Room - Authentication required
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => handleJoinRoom(room.roomId)}
                        className="btn btn-primary btn-sm"
                        disabled={!room.isActive}
                        style={{ flex: 1 }}
                      >
                        <FaVideo style={{ marginRight: '6px' }} />
                        Join Room
                      </button>
                      <button
                        onClick={() => copyRoomLink(room.roomId)}
                        className="btn btn-outline btn-sm"
                        title="Copy room link"
                      >
                        <FaExternalLinkAlt />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="btn btn-danger btn-sm"
                        title="Delete room"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: 'none'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/create-room" className="btn btn-primary">
              <FaPlus style={{ marginRight: '8px' }} />
              Create Room
            </Link>
            <Link to="/public-rooms" className="btn btn-outline-primary">
              <FaUsers style={{ marginRight: '8px' }} />
              Browse Public Rooms
            </Link>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              <FaSignOutAlt style={{ marginRight: '8px' }} />
              Main Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;