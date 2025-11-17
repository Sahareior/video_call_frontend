import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
        toast.error('Connection error. Please check your internet connection.');
      });

      // Room management events
      newSocket.on('room-users', ({ users }) => {
        console.log('👥 Users in room:', users);
        setRoomUsers(users);
      });

      newSocket.on('user-joined', ({ userName, socketId }) => {
        console.log('👤 User joined:', userName, socketId);
        setRoomUsers(prev => [...prev, { userName, socketId }]);
        toast.info(`${userName} joined the room`);
      });

      newSocket.on('user-left', ({ socketId, userName }) => {
        console.log('👤 User left:', userName, socketId);
        setRoomUsers(prev => prev.filter(user => user.socketId !== socketId));
        
        // Clean up peer connection
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].destroy();
          delete peersRef.current[socketId];
        }
        
        toast.info(`${userName || 'A user'} left the room`);
      });

      // WebRTC signaling events
      newSocket.on('offer', async ({ offer, senderSocketId, senderUserName }) => {
        await handleOffer(offer, senderSocketId, senderUserName);
      });

      newSocket.on('answer', async ({ answer, senderSocketId }) => {
        await handleAnswer(answer, senderSocketId);
      });

      newSocket.on('ice-candidate', async ({ candidate, senderSocketId }) => {
        await handleIceCandidate(candidate, senderSocketId);
      });

      // Screen sharing events
      newSocket.on('screen-share-started', ({ socketId, userName }) => {
        toast.info(`${userName} started screen sharing`);
        // You can implement UI changes here
      });

      newSocket.on('screen-share-stopped', ({ socketId }) => {
        toast.info('Screen sharing stopped');
        // You can implement UI changes here
      });

      // Error handling
      newSocket.on('error', ({ message }) => {
        toast.error(message);
      });

      setSocket(newSocket);

      return () => {
        cleanup();
      };
    }
  }, [user]);

  // Cleanup function
  const cleanup = () => {
    if (socket) {
      // Emit leave-room event before disconnecting
      if (currentRoom) {
        socket.emit('leave-room', { roomId: currentRoom });
      }
      socket.close();
    }
    setSocket(null);
    setIsConnected(false);
    setRoomUsers([]);
    setCurrentRoom(null);
    
    // Clean up all peer connections
    Object.values(peersRef.current).forEach(peer => {
      if (peer) peer.destroy();
    });
    peersRef.current = {};
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  // WebRTC helper functions
  const createPeerConnection = (targetSocketId, isInitiator) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };

    const peer = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      // You can emit this to components that need it
      window.dispatchEvent(new CustomEvent('remote-stream', {
        detail: { socketId: targetSocketId, stream: remoteStream }
      }));
    };

    // Handle connection state changes
    peer.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${targetSocketId}:`, peer.connectionState);
      
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        // Clean up failed connection
        if (peersRef.current[targetSocketId]) {
          peer.destroy();
          delete peersRef.current[targetSocketId];
        }
      }
    };

    peersRef.current[targetSocketId] = peer;
    return peer;
  };

  const handleOffer = async (offer, senderSocketId, senderUserName) => {
    try {
      const peer = createPeerConnection(senderSocketId, false);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('answer', {
        targetSocketId: senderSocketId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer, senderSocketId) => {
    try {
      const peer = peersRef.current[senderSocketId];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate, senderSocketId) => {
    try {
      const peer = peersRef.current[senderSocketId];
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const joinRoom = async (roomId, userName) => {
    if (!socket) {
      toast.error('Not connected to server');
      return false;
    }

    try {
      socket.emit('join-room', { roomId, userName });
      setCurrentRoom(roomId);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
      return false;
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      // Emit leave-room event to server
      socket.emit('leave-room', { roomId: currentRoom });
      
      setCurrentRoom(null);
      setRoomUsers([]);
      
      // Clean up all peer connections
      Object.values(peersRef.current).forEach(peer => {
        if (peer) peer.destroy();
      });
      peersRef.current = {};
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      
      toast.info('Left the room');
    }
  };

  const getLocalStream = async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });

      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  const startCall = async (targetSocketId) => {
    try {
      const peer = createPeerConnection(targetSocketId, true);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit('offer', {
        targetSocketId,
        offer
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Listen for screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

      socket.emit('screen-share-started');
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
      throw error;
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      
      // Replace screen track with camera track in all peer connections
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local stream
      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStreamRef.current.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localStreamRef.current.addTrack(videoTrack);
      }

      socket.emit('screen-share-stopped');
      return cameraStream;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      toast.error('Failed to stop screen sharing');
      throw error;
    }
  };

  const value = {
    socket,
    isConnected,
    roomUsers,
    currentRoom,
    joinRoom,
    leaveRoom,
    getLocalStream,
    startCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    localStream: localStreamRef.current
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};