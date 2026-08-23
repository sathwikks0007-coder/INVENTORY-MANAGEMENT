import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, ArrowUpRight } from 'lucide-react';
import FavouriteButton from './FavouriteButton';
import useFavourites from '../hooks/useFavourites';

const RecipeCard = ({ recipe }) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const isFav = isFavourite(recipe._id);

  if (!recipe) return null;

  return (
    <div
      className="card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}
          alt={recipe.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="recipe-card-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Category Pill */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2 }}>
          <span className="badge">{recipe.category}</span>
        </div>

        {/* Favourite Button */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 }}>
          <FavouriteButton isFav={isFav} onToggle={() => toggleFavourite(recipe)} />
        </div>

        {/* Overlay gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(23, 42, 58, 0.4) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Content Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Meta Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#718096' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} color="#6FAF98" />
            {recipe.cookTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ChefHat size={15} color="#E0A458" />
            {recipe.difficulty || 'Medium'}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Playfair Display',
            fontSize: '1.25rem',
            color: '#172A3A',
            marginBottom: '0.5rem',
            lineHeight: '1.3',
          }}
        >
          {recipe.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.9rem',
            color: '#718096',
            lineHeight: '1.5',
            marginBottom: '1.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {recipe.description || 'A delicious culinary creation prepared with fresh ingredients and vibrant flavours.'}
        </p>

        {/* Footer Link */}
        <Link
          to={`/recipe/${recipe._id}`}
          className="btn btn-outline"
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            fontSize: '0.88rem',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          <span>View Recipe</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <style>{`
        .card:hover .recipe-card-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};

export default RecipeCard;
