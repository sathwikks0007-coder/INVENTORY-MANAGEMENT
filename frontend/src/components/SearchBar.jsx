import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear, placeholder = 'Search recipes by name or ingredient...' }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          boxShadow: '0 8px 24px rgba(23, 42, 58, 0.08)',
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          transition: 'all 0.25s ease',
        }}
      >
        <Search size={22} color="#6FAF98" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            color: '#263238',
            backgroundColor: 'transparent',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: '4px',
              borderRadius: '50%',
              backgroundColor: '#EDF2F7',
              color: '#718096',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '0.5rem',
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
