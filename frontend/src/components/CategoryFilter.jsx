import React from 'react';

const CATEGORIES = [
  'All',
  'Breakfast',
  'Brunch',
  'Lunch',
  'Dinner',
  'Snacks',
  'Street Food',
  'Vegetarian',
  'Vegan',
  'Desserts',
  'Beverages',
  'Healthy',
  'Quick Meals',
  'International',
];

const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        overflowX: 'auto',
        padding: '0.5rem 0.25rem 1rem',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: isActive ? '#172A3A' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#263238',
              border: isActive ? '1px solid #172A3A' : '1px solid #E2E8F0',
              boxShadow: isActive ? '0 4px 12px rgba(23, 42, 58, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
