import React from 'react';
import { Link } from 'react-router-dom';
import useFavourites from '../hooks/useFavourites';
import RecipeCard from '../components/RecipeCard';
import { Heart, Compass } from 'lucide-react';

const FavouritesPage = () => {
  const { favourites } = useFavourites();

  return (
    <div style={{ padding: '4rem 0 6rem', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#FDF2F0',
              color: '#C44536',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Heart size={30} fill="#C44536" />
          </div>

          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', color: '#172A3A', marginBottom: '0.5rem' }}>
            Your Saved Favourites
          </h1>
          <p style={{ color: '#718096', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            A curated collection of your favorite recipes for quick access anytime.
          </p>
        </div>

        {/* Favourites Grid or Empty State */}
        {favourites.length === 0 ? (
          <div
            className="card animate-fade-in"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              maxWidth: '520px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', color: '#172A3A', marginBottom: '0.75rem' }}>
              You haven't saved any recipes yet.
            </h3>
            <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Browse our large collection of global recipes and click the heart icon on any recipe card to save your favorites here.
            </p>

            <Link to="/" className="btn btn-primary">
              <Compass size={18} /> Explore Recipes
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {favourites.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
