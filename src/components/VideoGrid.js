import React, { useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop } from 'react-icons/fa';

const VideoGrid = ({ 
  localStream, 
  remoteStreams = [], 
  localUser,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  isScreenSharing = false
}) => {
  const localVideoRef = useRef();
  const remoteVideoRefs = useRef({});

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote video streams
  useEffect(() => {
    remoteStreams.forEach(({ socketId, stream, userName }) => {
      if (remoteVideoRefs.current[socketId]) {
        remoteVideoRefs.current[socketId].srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const getGridClass = (count) => {
    if (count === 0) return 'video-grid single';
    if (count === 1) return 'video-grid single';
    if (count === 2) return 'video-grid dual';
    if (count <= 4) return 'video-grid triple';
    return 'video-grid more';
  };

  const isAudioEnabled = () => {
    if (!localStream) return false;
    const audioTrack = localStream.getAudioTracks()[0];
    return audioTrack ? audioTrack.enabled : false;
  };

  const isVideoEnabled = () => {
    if (!localStream) return false;
    const videoTrack = localStream.getVideoTracks()[0];
    return videoTrack ? videoTrack.enabled : false;
  };

  return (
    <div className={getGridClass(remoteStreams.length)}>
      {/* Local video */}
      <div className="video-container">
        <video
          ref={localVideoRef}
          className="video-element"
          autoPlay
          muted
          playsInline
        />
        <div className="video-overlay">
          <span>You ({localUser?.username})</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isAudioEnabled() && <FaMicrophoneSlash style={{ color: '#dc3545' }} />}
            {!isVideoEnabled() && <FaVideoSlash style={{ color: '#dc3545' }} />}
          </div>
        </div>
      </div>

      {/* Remote videos */}
      {remoteStreams.map(({ socketId, stream, userName }) => (
        <div key={socketId} className="video-container">
          <video
            ref={(el) => {
              if (el) remoteVideoRefs.current[socketId] = el;
            }}
            className="video-element"
            autoPlay
            playsInline
          />
          <div className="video-overlay">
            <span>{userName}</span>
          </div>
        </div>
      ))}

      {/* Controls overlay */}
      <div className="video-controls">
        <button
          className={`control-btn ${!isAudioEnabled() ? 'muted' : 'active'}`}
          onClick={onToggleAudio}
          title={isAudioEnabled() ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled() ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>

        <button
          className={`control-btn ${!isVideoEnabled() ? 'video-off' : 'active'}`}
          onClick={onToggleVideo}
          title={isVideoEnabled() ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled() ? <FaVideo /> : <FaVideoSlash />}
        </button>

        <button
          className={`control-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
          title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
        >
          <FaDesktop />
        </button>
      </div>
    </div>
  );
};

export default VideoGrid;