import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#172A3A',
        color: '#FFFFFF',
        padding: '4rem 0 2rem',
        marginTop: '6rem',
        borderTop: '4px solid #6FAF98',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#6FAF98',
                  color: '#172A3A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UtensilsCrossed size={22} />
              </div>
              <span style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                Plate & Pantry
              </span>
            </div>
            <p style={{ color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              A premium digital food discovery platform crafted for home cooks, food lovers, and culinary explorers. Discover flavours worth sharing.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontFamily: 'Playfair Display', fontSize: '1.15rem', color: '#6FAF98', marginBottom: '1.25rem' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: '#CBD5E0' }}>
              <li><Link to="/" style={{ color: '#CBD5E0', transition: 'color 0.2s' }}>Home</Link></li>
              <li><a href="/#explore" style={{ color: '#CBD5E0', transition: 'color 0.2s' }}>Explore All Recipes</a></li>
              <li><Link to="/favourites" style={{ color: '#CBD5E0', transition: 'color 0.2s' }}>Saved Favourites</Link></li>
              <li><Link to="/admin" style={{ color: '#CBD5E0', transition: 'color 0.2s' }}>Admin Recipe Management</Link></li>
              <li><Link to="/admin/add" style={{ color: '#CBD5E0', transition: 'color 0.2s' }}>Add New Recipe</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 style={{ fontFamily: 'Playfair Display', fontSize: '1.15rem', color: '#E0A458', marginBottom: '1.25rem' }}>
              Top Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: '#CBD5E0' }}>
              <li>Breakfast & Brunch</li>
              <li>Lunch Bowls & Wraps</li>
              <li>Global Dinner Classics</li>
              <li>Street Food Specialties</li>
              <li>Artisanal Desserts</li>
              <li>Healthy & Quick Meals</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.88rem',
            color: '#A0AEC0',
          }}
        >
          <span>&copy; {new Date().getFullYear()} Plate & Pantry. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Crafted with <Heart size={14} color="#C44536" fill="#C44536" /> for food enthusiasts everywhere.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
