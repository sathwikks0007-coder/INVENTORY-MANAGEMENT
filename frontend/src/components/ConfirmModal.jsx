import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 42, 58, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(23, 42, 58, 0.2)',
          position: 'relative',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: '#718096',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FDF2F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C44536',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.35rem', color: '#172A3A' }}>
              {title || 'Confirm Action'}
            </h3>
          </div>
        </div>

        <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            className="btn"
            style={{
              backgroundColor: '#EDF2F7',
              color: '#263238',
              padding: '0.6rem 1.25rem',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            style={{
              padding: '0.6rem 1.25rem',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
