import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    if (formData.username.length < 3) {
      alert('Username must be at least 3 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.username, 
        formData.email, 
        formData.password
      );
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      maxWidth: '500px', 
      marginTop: '80px',
      marginBottom: '80px'
    }}>
      <div className="card">
        <div className="card-header text-center">
          <FaUserPlus style={{ fontSize: '48px', color: '#28a745', marginBottom: '16px' }} />
          <h2 className="card-title">Create Account</h2>
          <p className="card-subtitle">Join VideoCall Pro and start connecting</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              disabled={loading}
              minLength="3"
              maxLength="30"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
                disabled={loading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
            style={{ 
              marginTop: '20px',
              fontSize: '16px',
              padding: '14px'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ marginBottom: '16px', color: '#6c757d' }}>
            Already have an account?
          </p>
          <Link to="/login" className="btn btn-outline w-100">
            Sign In
          </Link>
        </div>
      </div>

      {/* Terms and privacy info */}
      <div className="card" style={{ 
        backgroundColor: '#e7f3ff',
        border: '1px solid #b8daff',
        marginTop: '20px'
      }}>
        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          <h4 style={{ marginBottom: '12px', color: '#004085' }}>🔒 Privacy & Security</h4>
          <p style={{ color: '#004085', marginBottom: '12px' }}>
            Your data is secure with us. We use industry-standard encryption 
            to protect your personal information and video calls.
          </p>
          <div style={{ color: '#155724', fontSize: '12px' }}>
            ✓ End-to-end encryption for calls<br/>
            ✓ Secure data storage<br/>
            ✓ No data sharing with third parties
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;