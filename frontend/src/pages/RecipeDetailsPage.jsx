import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import useFavourites from '../hooks/useFavourites';
import FavouriteButton from '../components/FavouriteButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, ChefHat, ArrowLeft, Check, Share2, Utensils } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RecipeDetailsPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const { isFavourite, toggleFavourite } = useFavourites();
  const { showSuccess } = useToast();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recipeService.getRecipeById(id);
        setRecipe(data);
      } catch (err) {
        console.error('Error loading recipe details:', err);
        setError('Recipe not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Recipe link copied to clipboard!');
    }
  };

  if (loading) return <LoadingSpinner message="Fetching recipe details..." />;

  // 404 state if recipe does not exist
  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div
          className="card animate-fade-in"
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#FDF2F0',
              color: '#C44536',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <Utensils size={36} />
          </div>

          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: '#172A3A', marginBottom: '0.75rem' }}>
            Recipe not found
          </h2>
          <p style={{ color: '#718096', fontSize: '1rem', marginBottom: '2rem' }}>
            Sorry, we couldn’t find the recipe you’re looking for.
          </p>

          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const isFav = isFavourite(recipe._id);

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#172A3A',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <ArrowLeft size={18} /> Back to recipes
          </Link>

          <button
            onClick={handleShare}
            className="btn btn-outline"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <Share2 size={16} /> Share Recipe
          </button>
        </div>

        {/* Editorial Recipe Details Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '3.5rem',
            alignItems: 'start',
          }}
          className="recipe-details-grid"
        >
          {/* Left Column: Image & Overview */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(23, 42, 58, 0.12)',
                marginBottom: '2rem',
              }}
            >
              <img
                src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}
                alt={recipe.name}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                <FavouriteButton isFav={isFav} onToggle={() => toggleFavourite(recipe)} size={22} />
              </div>
            </div>

            {/* Quick Meta Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: '18px',
                boxShadow: '0 4px 16px rgba(23, 42, 58, 0.05)',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', uppercase: true, fontWeight: 700 }}>
                  CATEGORY
                </span>
                <p style={{ fontWeight: 700, color: '#172A3A', marginTop: '0.2rem' }}>{recipe.category}</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', uppercase: true, fontWeight: 700 }}>
                  COOK TIME
                </span>
                <p style={{ fontWeight: 700, color: '#172A3A', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Clock size={14} color="#6FAF98" /> {recipe.cookTime}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', uppercase: true, fontWeight: 700 }}>
                  DIFFICULTY
                </span>
                <p style={{ fontWeight: 700, color: '#172A3A', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <ChefHat size={14} color="#E0A458" /> {recipe.difficulty || 'Medium'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Description, Checklist & Steps */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge" style={{ marginBottom: '0.75rem' }}>
                {recipe.category}
              </span>
              <h1
                style={{
                  fontFamily: 'Playfair Display',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: '#172A3A',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}
              >
                {recipe.name}
              </h1>

              {recipe.description && (
                <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: 1.6, marginBottom: '2rem' }}>
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Ingredients Checklist */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#172A3A', marginBottom: '1.25rem' }}>
                Ingredients ({recipe.ingredients ? recipe.ingredients.length : 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleIngredientCheck(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.85rem 1.25rem',
                        backgroundColor: isChecked ? '#EBF4F0' : '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: isChecked ? 'none' : '2px solid #CBD5E0',
                          backgroundColor: isChecked ? '#6FAF98' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.98rem',
                          color: isChecked ? '#718096' : '#263238',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          fontWeight: isChecked ? 500 : 600,
                        }}
                      >
                        {ing}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#172A3A', marginBottom: '1.25rem' }}>
                Preparation Steps ({recipe.steps ? recipe.steps.length : 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {recipe.steps && recipe.steps.map((step, idx) => {
                  const stepNumber = String(idx + 1).padStart(2, '0');
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1.25rem',
                        backgroundColor: '#FFFFFF',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(23, 42, 58, 0.03)',
                      }}
                    >
                      {/* Numbered Circle */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#172A3A',
                          color: '#6FAF98',
                          fontFamily: 'Playfair Display',
                          fontWeight: 700,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {stepNumber}
                      </div>

                      <div style={{ paddingTop: '0.2rem' }}>
                        <p style={{ fontSize: '1rem', color: '#263238', lineHeight: 1.6 }}>
                          {step}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
