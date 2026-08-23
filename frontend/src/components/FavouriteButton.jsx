import React from 'react';
import { Heart } from 'lucide-react';

const FavouriteButton = ({ isFav, onToggle, size = 20, style = {} }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isFav ? '#FDF2F0' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isFav ? '#C44536' : '#718096',
        boxShadow: '0 4px 12px rgba(23, 42, 58, 0.1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: isFav ? '1px solid rgba(196, 69, 54, 0.3)' : '1px solid rgba(226, 232, 240, 0.8)',
        ...style,
      }}
    >
      <Heart
        size={size}
        fill={isFav ? '#C44536' : 'none'}
        strokeWidth={isFav ? 0 : 2}
      />
    </button>
  );
};

export default FavouriteButton;
