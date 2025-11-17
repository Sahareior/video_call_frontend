import React from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaUsers, FaShieldAlt, FaRocket, FaArrowRight,FaDesktop } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="container" style={{ marginTop: '60px' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
        marginBottom: '60px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FaVideo style={{ fontSize: '80px', marginBottom: '24px' }} />
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            VideoCall Pro
          </h1>
          <p style={{ 
            fontSize: '20px', 
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Connect with friends, family, and colleagues through high-quality 
            video calls. Create rooms, join conversations, and experience 
            seamless group video communication.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-light" style={{ 
              fontSize: '18px',
              padding: '16px 32px',
              fontWeight: '600'
            }}>
              Get Started Free
              <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/public-rooms" className="btn btn-outline-light" style={{ 
              fontSize: '18px',
              padding: '16px 32px'
            }}>
              Browse Public Rooms
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Why Choose VideoCall Pro?
          </h2>
          <p style={{ fontSize: '18px', color: '#6c757d', maxWidth: '600px', margin: '0 auto' }}>
            Experience the future of video communication with our cutting-edge platform
          </p>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="card" style={{ textAlign: 'center', height: '100%' }}>
              <FaVideo style={{ fontSize: '48px', color: '#007bff', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                HD Video Quality
              </h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Crystal clear video calls with up to 720p resolution and 30fps performance. 
                Enjoy professional-quality video meetings without any lag.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card" style={{ textAlign: 'center', height: '100%' }}>
              <FaUsers style={{ fontSize: '48px', color: '#28a745', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Group Calls
              </h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Host or join group video calls with up to 50 participants. 
                Perfect for team meetings, family gatherings, or social events.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card" style={{ textAlign: 'center', height: '100%' }}>
              <FaShieldAlt style={{ fontSize: '48px', color: '#6f42c1', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Secure & Private
              </h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Your conversations are protected with end-to-end encryption. 
                Create private rooms with passwords for ultimate security.
              </p>
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: '40px' }}>
          <div className="col-md-6">
            <div className="card" style={{ textAlign: 'center', height: '100%' }}>
              <FaDesktop style={{ fontSize: '48px', color: '#fd7e14', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Screen Sharing
              </h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Share your screen for presentations, collaborations, or demonstrations. 
                Switch seamlessly between camera and screen sharing.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card" style={{ textAlign: 'center', height: '100%' }}>
              <FaRocket style={{ fontSize: '48px', color: '#e83e8c', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Easy to Use
              </h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                No downloads required! Simply create a room or join with a link. 
                Works on all devices and browsers instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '20px',
        margin: '40px 0'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '18px', color: '#6c757d', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Join thousands of users who trust VideoCall Pro for their communication needs. 
          It's completely free to get started!
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Account
          </Link>
          <Link to="/login" className="btn btn-outline-primary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;