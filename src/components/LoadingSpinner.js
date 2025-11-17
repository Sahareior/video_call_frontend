import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const spinnerSize = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  return (
    <div className="loading-spinner">
      <div style={{ textAlign: 'center' }}>
        <div 
          className="spinner"
          style={{
            width: spinnerSize[size],
            height: spinnerSize[size],
            borderWidth: '4px'
          }}
        />
        {message && (
          <p style={{ 
            marginTop: '16px', 
            color: '#6c757d',
            fontSize: '14px'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;