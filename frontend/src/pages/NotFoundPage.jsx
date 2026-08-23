import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Utensils } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#FDF6EC',
            color: '#E0A458',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <Utensils size={40} />
        </div>

        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', color: '#172A3A', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#263238', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>

        <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
