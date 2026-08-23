import React, { useState, useEffect } from 'react';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RecipeSkeleton from '../components/RecipeSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { Sparkles, SlidersHorizontal, ArrowDown } from 'lucide-react';

const SORT_OPTIONS = [
  'Latest',
  'Name A-Z',
  'Name Z-A',
  'Quickest Cooking Time',
  'Longest Cooking Time',
];

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Latest');

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeService.getAllRecipes({
        name: searchQuery,
        category: selectedCategory,
        sort: selectedSort,
      });
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Could not connect to the recipe server. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSort('Latest');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: '4rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(248, 245, 239, 1) 0%, rgba(235, 244, 240, 0.4) 100%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Hero Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  backgroundColor: '#EBF4F0',
                  color: '#2F6B56',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={16} /> Editorial Culinary Platform
              </div>

              <h1
                style={{
                  fontFamily: 'Playfair Display',
                  fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                  fontWeight: 800,
                  color: '#172A3A',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Recipes for every mood, moment and craving.
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#718096',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '540px',
                }}
              >
                Explore global flavours, comforting classics and fresh ideas for your next delicious meal.
              </p>

              {/* Large Search Bar in Hero */}
              <div style={{ marginBottom: '1.5rem' }}>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search recipes (e.g. Dosa, Soufflé, Tacos)..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a href="#explore" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                  Explore Recipes <ArrowDown size={18} />
                </a>
              </div>
            </div>

            {/* Hero Right Visual Collage */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1.25rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    height: '260px',
                    boxShadow: '0 16px 32px rgba(23, 42, 58, 0.12)',
                    transform: 'translateY(-15px)',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80"
                    alt="Japanese Soufflé Pancakes"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    height: '260px',
                    boxShadow: '0 16px 32px rgba(23, 42, 58, 0.12)',
                    transform: 'translateY(25px)',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80"
                    alt="Creamy Garlic Mushroom Pasta"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Decorative Tag */}
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '9999px',
                  boxShadow: '0 12px 30px rgba(23, 42, 58, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  whiteSpace: 'nowrap',
                  zIndex: 3,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#6FAF98',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#172A3A' }}>
                  60+ Handcrafted Tested Recipes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECIPE DISCOVERY SECTION */}
      <section id="explore" style={{ padding: '4rem 0' }}>
        <div className="container">
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.25rem', color: '#172A3A' }}>
                  Find something delicious
                </h2>
                {!loading && recipes && (
                  <span
                    style={{
                      backgroundColor: '#E0A458',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                  </span>
                )}
              </div>
              <p style={{ color: '#718096', fontSize: '1rem' }}>
                Filter by dietary preference, meal category or cooking time.
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <SlidersHorizontal size={18} color="#718096" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#263238',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    Sort by: {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ marginBottom: '2.5rem' }}>
            <CategoryFilter activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>

          {/* Content States */}
          {loading ? (
            <RecipeSkeleton count={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchRecipes} />
          ) : recipes.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
