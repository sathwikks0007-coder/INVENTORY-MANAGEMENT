import { useState, useEffect } from 'react';

const STORAGE_KEY = 'plate_pantry_favourites';

export const useFavourites = () => {
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse favourites from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch (e) {
      console.error('Failed to save favourites to localStorage', e);
    }
  }, [favourites]);

  const isFavourite = (recipeId) => {
    if (!recipeId) return false;
    return favourites.some((item) => (typeof item === 'string' ? item === recipeId : item._id === recipeId));
  };

  const toggleFavourite = (recipe) => {
    if (!recipe || (!recipe._id && typeof recipe !== 'string')) return;

    const id = typeof recipe === 'string' ? recipe : recipe._id;

    setFavourites((prev) => {
      const exists = prev.some((item) => (typeof item === 'string' ? item === id : item._id === id));
      if (exists) {
        return prev.filter((item) => (typeof item === 'string' ? item !== id : item._id !== id));
      } else {
        // Store full recipe object so favourites view can render immediately even offline/cached
        return [...prev, recipe];
      }
    });
  };

  return {
    favourites,
    isFavourite,
    toggleFavourite,
    totalFavourites: favourites.length,
  };
};

export default useFavourites;
