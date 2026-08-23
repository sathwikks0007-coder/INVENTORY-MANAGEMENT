import React from 'react';

const RecipeSkeleton = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            height: '380px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div className="skeleton" style={{ height: '220px', width: '100%' }} />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div className="skeleton" style={{ height: '16px', width: '40%' }} />
            <div className="skeleton" style={{ height: '24px', width: '80%' }} />
            <div className="skeleton" style={{ height: '14px', width: '100%' }} />
            <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: 'auto' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeSkeleton;
