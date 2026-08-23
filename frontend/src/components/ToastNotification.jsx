import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const ToastNotification = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  return (
    <div
      className="animate-fade-in"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: '#FFFFFF',
        color: '#263238',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(23, 42, 58, 0.15)',
        borderLeft: `5px solid ${isSuccess ? '#6FAF98' : '#C44536'}`,
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {isSuccess ? (
        <CheckCircle size={20} color="#6FAF98" />
      ) : (
        <AlertCircle size={20} color="#C44536" />
      )}
      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{ color: '#718096', padding: '2px', display: 'flex', alignItems: 'center' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastNotification;
