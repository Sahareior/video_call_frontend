import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaVideo, 
  FaUsers, 
  FaLock, 
  FaUnlock, 
  FaCalendarAlt,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const JoinRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { joinRoom } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoom();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const response = await api.get(`/rooms/room/${roomId}`);
      setRoom(response.data.room);
    } catch (error) {
      console.error('Error loading room:', error);
      const message = error.response?.data?.message || 'Room not found';
      toast.error(message);
      
      // If room requires auth but user is not authenticated, redirect to login
      if (message.includes('authentication required')) {
        toast.info('Please log in to join this private room');
        navigate('/login');
        return;
      }
      
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setJoining(true);
    
    try {
      const success = await joinRoom(roomId, user.username);
      
      if (success) {
        navigate(`/room/${roomId}`);
        toast.success('Joining room...');
      } else {
        throw new Error('Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const copyRoomLink = () => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailabilityStatus = () => {
    if (!room) return null;
    
    if (room.participants >= room.maxParticipants) {
      return {
        status: 'Full',
        color: '#dc3545',
        message: 'This room is currently full. Please try again later.'
      };
    }
    
    if (room.participants > 0) {
      return {
        status: 'Available',
        color: '#28a745',
        message: 'Room is active and ready to join!'
      };
    }
    
    return {
      status: 'Available',
      color: '#6c757d',
      message: 'Room is available. Be the first to join!'
    };
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '60px' }}>
        <LoadingSpinner message="Loading room information..." />
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="container" style={{ marginTop: '60px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '60px 20px' }}>
          <h2>Room ID Required</h2>
          <p>Please provide a valid room ID to join a room.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container" style={{ marginTop: '60px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '60px 20px' }}>
          <h2>Room Not Found</h2>
          <p>The room you're trying to join doesn't exist or has been removed.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
            <button onClick={() => navigate('/public-rooms')} className="btn btn-outline">
              Browse Public Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="container" style={{ marginTop: '60px', marginBottom: '60px', maxWidth: '600px' }}>
      <div className="card">
        <div className="card-header text-center">
          <FaVideo style={{ fontSize: '48px', color: '#007bff', marginBottom: '16px' }} />
          <h2 className="card-title">Join Room</h2>
          <p className="card-subtitle">Ready to join the conversation?</p>
        </div>

        {/* Room Information */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', margin: 0, flex: 1 }}>
                {room.name}
              </h3>
              <div style={{ 
                padding: '6px 12px', 
                backgroundColor: availabilityStatus.color + '20',
                color: availabilityStatus.color,
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                marginLeft: '12px'
              }}>
                {availabilityStatus.status}
              </div>
            </div>

            {room.description && (
              <p style={{ color: '#6c757d', marginBottom: '16px', lineHeight: '1.6' }}>
                {room.description}
              </p>
            )}

            {/* Room Details */}
            <div className="row">
              <div className="col-md-6">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  <FaUsers style={{ marginRight: '8px', color: '#007bff' }} />
                  <span style={{ color: '#6c757d' }}>Host:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                    {room.host.username}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  <FaUsers style={{ marginRight: '8px', color: '#28a745' }} />
                  <span style={{ color: '#6c757d' }}>Participants:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                    {room.participants}/{room.maxParticipants}
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  {room.isPublic ? (
                    <FaUnlock style={{ marginRight: '8px', color: '#28a745' }} />
                  ) : (
                    <FaLock style={{ marginRight: '8px', color: '#dc3545' }} />
                  )}
                  <span style={{ color: '#6c757d' }}>Type:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                    {room.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  <FaCalendarAlt style={{ marginRight: '8px', color: '#6f42c1' }} />
                  <span style={{ color: '#6c757d' }}>Created:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                    {formatDate(room.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Message */}
          <div style={{
            padding: '16px',
            backgroundColor: availabilityStatus.color + '10',
            border: `1px solid ${availabilityStatus.color}30`,
            borderRadius: '8px',
            color: availabilityStatus.color,
            textAlign: 'center',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            {availabilityStatus.message}
          </div>

          {/* Room Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Room Features:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {room.settings.allowScreenShare && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#e7f3ff',
                  color: '#004085',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  📺 Screen Sharing
                </span>
              )}
              {room.settings.allowChat && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#f3e5f5',
                  color: '#4a148c',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  💬 Text Chat
                </span>
              )}
              {room.settings.allowRecording && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#fce4ec',
                  color: '#880e4f',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  🎬 Recording
                </span>
              )}
              {room.settings.muteOnJoin && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  🔇 Auto Mute
                </span>
              )}
              {room.settings.videoOffOnJoin && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  📷 Auto Camera Off
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleJoinRoom}
            disabled={joining || room.participants >= room.maxParticipants}
            className="btn btn-primary btn-lg"
            style={{ 
              minWidth: '150px',
              flex: room.participants < room.maxParticipants ? 'none' : '1'
            }}
          >
            {joining ? (
              <>
                <div className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  borderWidth: '2px',
                  marginRight: '8px',
                  display: 'inline-block'
                }} />
                Joining...
              </>
            ) : room.participants >= room.maxParticipants ? (
              'Room Full'
            ) : (
              <>
                <FaVideo style={{ marginRight: '8px' }} />
                Join Room
              </>
            )}
          </button>

          <button
            onClick={copyRoomLink}
            className="btn btn-outline btn-lg"
            disabled={joining}
          >
            <FaCopy style={{ marginRight: '8px' }} />
            Copy Link
          </button>

          <button
            onClick={() => {
              const link = `${window.location.origin}/room/${roomId}`;
              window.open(link, '_blank');
            }}
            className="btn btn-outline btn-lg"
            disabled={joining}
          >
            <FaExternalLinkAlt style={{ marginRight: '8px' }} />
            Open in New Tab
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6c757d', marginBottom: '16px' }}>
            Not the right room?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary btn-sm"
            >
              My Dashboard
            </button>
            <button 
              onClick={() => navigate('/public-rooms')}
              className="btn btn-outline btn-sm"
            >
              Browse Public Rooms
            </button>
            <button 
              onClick={() => navigate('/create-room')}
              className="btn btn-outline btn-sm"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="card" style={{ 
        backgroundColor: '#e7f3ff',
        border: '1px solid #b8daff',
        marginTop: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#004085' }}>
            💡 Joining Tips
          </h4>
          <ul style={{ 
            textAlign: 'left', 
            fontSize: '14px', 
            color: '#004085',
            maxWidth: '500px',
            margin: '0 auto',
            paddingLeft: '20px'
          }}>
            <li>Make sure your camera and microphone are working</li>
            <li>Use headphones for better audio quality</li>
            <li>Ensure you have a stable internet connection</li>
            <li>You can share your screen during the call</li>
            <li>All conversations are encrypted for your privacy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;