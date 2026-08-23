import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Unable to connect to Plate & Pantry backend server.', onRetry }) => {
  return (
    <div
      className="card animate-fade-in"
      style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        maxWidth: '520px',
        margin: '2rem auto',
        borderColor: '#FDF2F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FDF2F0',
          color: '#C44536',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <AlertCircle size={32} />
      </div>

      <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#172A3A', marginBottom: '0.75rem' }}>
        Connection Issue
      </h3>

      <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
        {message}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline">
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
