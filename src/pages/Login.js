import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
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
          <FaSignInAlt style={{ fontSize: '48px', color: '#007bff', marginBottom: '16px' }} />
          <h2 className="card-title">Welcome Back</h2>
          <p className="card-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                required
                disabled={loading}
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

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ 
              marginTop: '20px',
              fontSize: '16px',
              padding: '14px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ marginBottom: '16px', color: '#6c757d' }}>
            Don't have an account?
          </p>
          <Link to="/register" className="btn btn-outline w-100">
            Create Account
          </Link>
        </div>
      </div>

      {/* Demo account info */}
      <div className="card" style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        marginTop: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>🚀 Quick Demo</h4>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
            Try the app right away with these demo credentials:
          </p>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div><strong>Email:</strong> demo@videocall.com</div>
            <div><strong>Password:</strong> demo123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;