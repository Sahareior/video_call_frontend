import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaUsers, 
  FaLock, 
  FaUnlock, 
  FaVideo, 
  FaMicrophone,
  FaDesktop,
  FaComments
} from 'react-icons/fa';

const CreateRoom = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    password: '',
    maxParticipants: 10,
    settings: {
      allowScreenShare: true,
      allowChat: true,
      allowRecording: false,
      muteOnJoin: false,
      videoOffOnJoin: false
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const setting = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [setting]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    if (formData.maxParticipants < 2 || formData.maxParticipants > 50) {
      toast.error('Max participants must be between 2 and 50');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/rooms/create', formData);
      const { room } = response.data;
      
      toast.success('Room created successfully!');
      navigate(`/room/${room.roomId}`);
      
    } catch (error) {
      console.error('Error creating room:', error);
      const message = error.response?.data?.message || 'Failed to create room';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const participantOptions = [
    { value: 2, label: '2 participants' },
    { value: 4, label: '4 participants' },
    { value: 6, label: '6 participants' },
    { value: 8, label: '8 participants' },
    { value: 10, label: '10 participants' },
    { value: 20, label: '20 participants' },
    { value: 50, label: '50 participants' }
  ];

  return (
    <div className="container" style={{ marginTop: '60px', marginBottom: '60px', maxWidth: '800px' }}>
      <div className="card">
        <div className="card-header text-center">
          <FaPlus style={{ fontSize: '48px', color: '#28a745', marginBottom: '16px' }} />
          <h2 className="card-title">Create New Room</h2>
          <p className="card-subtitle">Set up your video call space</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
              Basic Information
            </h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Room Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter room name (e.g., Team Meeting, Family Chat)"
                required
                disabled={loading}
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional room description"
                rows="3"
                disabled={loading}
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="maxParticipants">
                Maximum Participants
              </label>
              <select
                id="maxParticipants"
                name="maxParticipants"
                className="form-control"
                value={formData.maxParticipants}
                onChange={handleChange}
                disabled={loading}
              >
                {participantOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
              Privacy & Access
            </h3>

            <div className="form-group">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="isPublic"
                    value="true"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ marginRight: '8px' }}
                  />
                  <FaUnlock style={{ marginRight: '6px', color: '#28a745' }} />
                  <span>Public Room</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="isPublic"
                    value="false"
                    checked={!formData.isPublic}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ marginRight: '8px' }}
                  />
                  <FaLock style={{ marginRight: '6px', color: '#dc3545' }} />
                  <span>Private Room</span>
                </label>
              </div>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginTop: '8px',
                marginLeft: '32px'
              }}>
                {formData.isPublic 
                  ? 'Anyone with the link can join this room'
                  : 'Only authenticated users can join this room'
                }
              </p>
            </div>

            {!formData.isPublic && (
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Room Password (Optional)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password for extra security"
                  disabled={loading}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6c757d', 
                  marginTop: '4px'
                }}>
                  Leave empty for no password protection
                </p>
              </div>
            )}
          </div>

          {/* Room Settings */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
              Room Settings
            </h3>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="settings.allowScreenShare"
                      checked={formData.settings.allowScreenShare}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ marginRight: '12px' }}
                    />
                    <FaDesktop style={{ marginRight: '8px', color: '#fd7e14' }} />
                    <span>Allow Screen Sharing</span>
                  </label>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '4px',
                    marginLeft: '32px'
                  }}>
                    Participants can share their screens
                  </p>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="settings.allowChat"
                      checked={formData.settings.allowChat}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ marginRight: '12px' }}
                    />
                    <FaComments style={{ marginRight: '8px', color: '#6f42c1' }} />
                    <span>Allow Chat</span>
                  </label>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '4px',
                    marginLeft: '32px'
                  }}>
                    Text chat feature in the room
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="settings.allowRecording"
                      checked={formData.settings.allowRecording}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ marginRight: '12px' }}
                    />
                    <FaVideo style={{ marginRight: '8px', color: '#e83e8c' }} />
                    <span>Allow Recording</span>
                  </label>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '4px',
                    marginLeft: '32px'
                  }}>
                    Record the meeting (if available)
                  </p>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="settings.muteOnJoin"
                      checked={formData.settings.muteOnJoin}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ marginRight: '12px' }}
                    />
                    <FaMicrophone style={{ marginRight: '8px', color: '#ffc107' }} />
                    <span>Mute on Join</span>
                  </label>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '4px',
                    marginLeft: '32px'
                  }}>
                    Automatically mute microphones when joining
                  </p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="settings.videoOffOnJoin"
                  checked={formData.settings.videoOffOnJoin}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ marginRight: '12px' }}
                />
                <FaVideo style={{ marginRight: '8px', color: '#dc3545' }} />
                <span>Turn off camera on Join</span>
              </label>
              <p style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                marginTop: '4px',
                marginLeft: '32px'
              }}>
                Automatically disable cameras when joining
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ 
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={loading}
              style={{ 
                minWidth: '200px',
                fontSize: '16px'
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    borderWidth: '2px',
                    marginRight: '8px',
                    display: 'inline-block'
                  }} />
                  Creating Room...
                </>
              ) : (
                <>
                  <FaPlus style={{ marginRight: '8px' }} />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;