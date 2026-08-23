import React from 'react';
import { Utensils, RotateCcw } from 'lucide-react';

const EmptyState = ({ title = 'No recipes found', message = 'We couldn’t find any recipes matching your current search or category filters.', onReset }) => {
  return (
    <div
      className="card animate-fade-in"
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        maxWidth: '520px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#FDF6EC',
          color: '#E0A458',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Utensils size={36} />
      </div>

      <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', color: '#172A3A', marginBottom: '0.75rem' }}>
        {title}
      </h3>

      <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
        {message}
      </p>

      {onReset && (
        <button onClick={onReset} className="btn btn-primary">
          <RotateCcw size={16} /> Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
