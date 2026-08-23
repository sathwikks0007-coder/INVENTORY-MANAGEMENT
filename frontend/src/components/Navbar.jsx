import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Heart, LayoutDashboard, Home, Compass, Menu, X } from 'lucide-react';
import useFavourites from '../hooks/useFavourites';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { totalFavourites } = useFavourites();

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(248, 245, 239, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#172A3A',
              color: '#6FAF98',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(23, 42, 58, 0.15)',
            }}
          >
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Playfair Display',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#172A3A',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              Plate & Pantry
            </span>
            <span style={{ fontSize: '0.7rem', color: '#718096', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Discover flavours worth sharing
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/') ? '#6FAF98' : '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s',
            }}
          >
            <Home size={18} />
            Home
          </Link>
          <a
            href="/#explore"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s',
            }}
          >
            <Compass size={18} />
            Explore
          </a>
          <Link
            to="/favourites"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/favourites') ? '#6FAF98' : '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <Heart size={18} color={isActive('/favourites') ? '#6FAF98' : '#263238'} />
            Favourites
            {totalFavourites > 0 && (
              <span
                style={{
                  backgroundColor: '#E0A458',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '2px',
                }}
              >
                {totalFavourites}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className="btn btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.88rem',
            }}
          >
            <LayoutDashboard size={16} />
            Admin Dashboard
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{ display: 'none', color: '#172A3A', padding: '0.5rem' }}
          className="mobile-hamburger-btn"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: isActive('/') ? '#6FAF98' : '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Home size={20} /> Home
          </Link>
          <a
            href="/#explore"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Compass size={20} /> Explore Recipes
          </a>
          <Link
            to="/favourites"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: isActive('/favourites') ? '#6FAF98' : '#263238',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Heart size={20} /> Favourites ({totalFavourites})
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <LayoutDashboard size={18} /> Admin Dashboard
          </Link>
        </div>
      )}

      {/* Media query stylesheet inline injection for responsive menu */}
      <style>{`
        @media (max-width: 868px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
