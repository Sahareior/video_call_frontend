import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaUsers, 
  FaSearch, 
  FaVideo, 
  FaClock,
  FaExternalLinkAlt,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const PublicRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();
  const { joinRoom } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicRooms();
  }, [currentPage, sortBy, filterBy]);

  const loadPublicRooms = async () => {
    try {
      const response = await api.get('/rooms/public', {
        params: {
          page: currentPage,
          limit: 12,
          sort: sortBy,
          filter: filterBy
        }
      });

      let filteredRooms = response.data.rooms;

      // Apply search filter
      if (searchTerm.trim()) {
        filteredRooms = filteredRooms.filter(room =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.host.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setRooms(filteredRooms);
      setTotalPages(response.data.pagination.totalPages);
      
    } catch (error) {
      console.error('Error loading public rooms:', error);
      toast.error('Failed to load public rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPublicRooms();
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoomStatus = (room) => {
    if (room.participants >= room.maxParticipants) {
      return { text: 'Full', color: '#dc3545' };
    }
    if (room.participants > 0) {
      return { text: 'Active', color: '#28a745' };
    }
    return { text: 'Empty', color: '#6c757d' };
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '60px' }}>
        <LoadingSpinner message="Loading public rooms..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '60px', marginBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
          Public Rooms
        </h1>
        <p style={{ fontSize: '18px', color: '#6c757d', maxWidth: '600px', margin: '0 auto' }}>
          Discover and join public video call rooms. Connect with people from around the world!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSearch}>
          <div className="row" style={{ alignItems: 'center' }}>
            <div className="col-md-6">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d'
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search rooms by name, description, or host..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select
                  className="form-control"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Rooms</option>
                  <option value="active">Active Only</option>
                  <option value="empty">Empty Rooms</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button type="submit" className="btn btn-primary">
              <FaSearch style={{ marginRight: '8px' }} />
              Search Rooms
            </button>
          </div>
        </form>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaVideo style={{ fontSize: '64px', color: '#dee2e6', marginBottom: '24px' }} />
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
            No rooms found
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '32px' }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'No public rooms available at the moment'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                loadPublicRooms();
              }}
              className="btn btn-primary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="row">
          {rooms.map((room) => {
            const status = getRoomStatus(room);
            return (
              <div key={room.id} className="col-md-6 col-lg-4">
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        margin: 0, 
                        flex: 1,
                        marginRight: '8px'
                      }}>
                        {room.name}
                      </h4>
                      <div style={{ 
                        padding: '4px 8px', 
                        backgroundColor: status.color + '20',
                        color: status.color,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        {status.text}
                      </div>
                    </div>

                    {room.description && (
                      <p style={{ 
                        color: '#6c757d', 
                        marginBottom: '16px', 
                        fontSize: '14px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
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
                        <span style={{ color: '#6c757d' }}>Host:</span>
                        <span style={{ fontWeight: '500' }}>{room.host.username}</span>
                      </div>
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

                    {/* Availability indicator */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: status.color,
                        marginRight: '8px'
                      }} />
                      <span style={{ color: '#6c757d' }}>
                        {room.participants >= room.maxParticipants
                          ? 'Room is full'
                          : room.participants === 0
                          ? 'Waiting for participants'
                          : 'Active conversation'
                        }
                      </span>
                    </div>
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
                        disabled={room.participants >= room.maxParticipants}
                        style={{ flex: 1 }}
                      >
                        <FaVideo style={{ marginRight: '6px' }} />
                        {room.participants >= room.maxParticipants ? 'Full' : 'Join Room'}
                      </button>
                      <button
                        onClick={() => copyRoomLink(room.roomId)}
                        className="btn btn-outline btn-sm"
                        title="Copy room link"
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          marginTop: '40px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          
          <span style={{ color: '#6c757d' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: 'none',
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
          Can't find what you're looking for?
        </h3>
        <p style={{ color: '#6c757d', marginBottom: '24px' }}>
          Create your own public room and start connecting with people from around the world!
        </p>
        <button
          onClick={() => navigate('/create-room')}
          className="btn btn-success btn-lg"
        >
          Create Public Room
        </button>
      </div>
    </div>
  );
};

export default PublicRooms;