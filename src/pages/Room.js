import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { 
  FaSignOutAlt, 
  FaUsers, 
  FaShare, 
  FaCopy,
  FaCog
} from 'react-icons/fa';

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { 
    socket, 
    isConnected, 
    roomUsers, 
    joinRoom, 
    leaveRoom,
    getLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare
  } = useSocket();

  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const eventListeners = useRef([]);

  useEffect(() => {
    loadRoom();
    
    // Set up event listeners for remote streams
    const handleRemoteStream = (event) => {
      const { socketId, stream } = event.detail;
      setRemoteStreams(prev => {
        // Remove existing stream for this socketId
        const filtered = prev.filter(s => s.socketId !== socketId);
        // Add new stream
        const userData = roomUsers.find(u => u.socketId === socketId);
        return [...filtered, { socketId, stream, userName: userData?.userName || 'Unknown User' }];
      });
    };

    window.addEventListener('remote-stream', handleRemoteStream);
    eventListeners.current.push(['remote-stream', handleRemoteStream]);

    return () => {
      // Clean up event listeners
      eventListeners.current.forEach(([eventName, handler]) => {
        window.removeEventListener(eventName, handler);
      });
      eventListeners.current = [];
      
      // Leave room and clean up
      leaveRoom();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Update remote streams when room users change
    setRemoteStreams(prev => {
      return roomUsers
        .filter(userData => userData.socketId !== socket?.id) // Exclude self
        .map(userData => {
          const existingStream = prev.find(s => s.socketId === userData.socketId);
          return {
            socketId: userData.socketId,
            stream: existingStream?.stream || null,
            userName: userData.userName
          };
        });
    });
  }, [roomUsers, socket]);

  const loadRoom = async () => {
    try {
      const response = await api.get(`/rooms/room/${roomId}`);
      setRoom(response.data.room);
    } catch (error) {
      console.error('Error loading room:', error);
      const message = error.response?.data?.message || 'Failed to load room';
      toast.error(message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    setJoining(true);
    
    try {
      // Get user media
      const stream = await getLocalStream(true, true);
      setLocalStream(stream);
      setAudioEnabled(true);
      setVideoEnabled(true);

      // Join the room
      const success = await joinRoom(roomId, user.username);
      
      if (success) {
        toast.success('Joined room successfully!');
      } else {
        throw new Error('Failed to join room');
      }

    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room. Please check your camera and microphone permissions.');
      // Clean up stream if join failed
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStreams([]);
    navigate('/dashboard');
    toast.info('Left the room');
  };

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setAudioEnabled(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  const handleStartScreenShare = async () => {
    try {
      await startScreenShare();
      setIsScreenSharing(true);
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const handleStopScreenShare = async () => {
    try {
      await stopScreenShare();
      setIsScreenSharing(false);
      toast.info('Screen sharing stopped');
    } catch (error) {
      console.error('Stop screen share error:', error);
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

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '60px' }}>
        <LoadingSpinner message="Loading room..." />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container" style={{ marginTop: '60px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '60px 20px' }}>
          <h2>Room Not Found</h2>
          <p>The room you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000',
      position: 'relative'
    }}>
      {/* Room Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {room.name}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px',
              opacity: 0.9
            }}>
              <FaUsers />
              <span>{roomUsers.length}/{room.maxParticipants} participants</span>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#28a745' : '#dc3545'
              }} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowRoomInfo(!showRoomInfo)}
            className="btn btn-outline-light btn-sm"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <FaCog />
          </button>
          <button
            onClick={copyRoomLink}
            className="btn btn-outline-light btn-sm"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <FaShare />
          </button>
          <button
            onClick={handleLeaveRoom}
            className="btn btn-danger btn-sm"
          >
            <FaSignOutAlt style={{ marginRight: '6px' }} />
            Leave Room
          </button>
        </div>
      </div>

      {!localStream && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div className="card" style={{ 
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '500px'
          }}>
            <h2 style={{ marginBottom: '16px' }}>Join Room</h2>
            <p style={{ marginBottom: '24px', color: '#6c757d' }}>
              You are about to join <strong>{room.name}</strong>
            </p>
            
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#6c757d' }}>
              <p>🔒 {room.isPublic ? 'Public Room' : 'Private Room'}</p>
              <p>👥 Room for up to {room.maxParticipants} participants</p>
              <p>🎥 Your camera and microphone will be used</p>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={joining || !isConnected}
              className="btn btn-primary btn-lg"
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
                  Joining Room...
                </>
              ) : (
                'Join Room'
              )}
            </button>
            
            {!isConnected && (
              <p style={{ 
                marginTop: '16px', 
                color: '#dc3545',
                fontSize: '14px'
              }}>
                Not connected to server. Please check your internet connection.
              </p>
            )}
          </div>
        </div>
      )}

      {localStream && (
        <VideoGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          localUser={user}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onStartScreenShare={handleStartScreenShare}
          onStopScreenShare={handleStopScreenShare}
          isScreenSharing={isScreenSharing}
        />
      )}

      {/* Room Info Modal */}
      {showRoomInfo && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxWidth: '300px'
        }}>
          <h4 style={{ marginBottom: '16px' }}>Room Information</h4>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Name:</strong> {room.name}</p>
            <p><strong>Participants:</strong> {roomUsers.length}/{room.maxParticipants}</p>
            <p><strong>Status:</strong> {room.isPublic ? 'Public' : 'Private'}</p>
            <p><strong>Host:</strong> {room.host.username}</p>
            <p><strong>Created:</strong> {new Date(room.createdAt).toLocaleDateString()}</p>
          </div>
          
          <button
            onClick={copyRoomLink}
            className="btn btn-outline-light btn-sm w-100"
            style={{ marginTop: '16px' }}
          >
            <FaCopy style={{ marginRight: '6px' }} />
            Copy Room Link
          </button>
          
          <button
            onClick={() => setShowRoomInfo(false)}
            className="btn btn-light btn-sm w-100"
            style={{ marginTop: '8px' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Participants List */}
      {roomUsers.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '14px' }}>
            <strong>Participants ({roomUsers.length}):</strong>
            {roomUsers.map((userData, index) => (
              <div key={userData.socketId} style={{ marginTop: '4px' }}>
                {userData.userName} {userData.socketId === socket?.id ? '(You)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;