import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('city-sense-favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);
  
  const addFavorite = (city: string) => {
    const newFavorites = [...new Set([...favorites, city])];
    setFavorites(newFavorites);
    localStorage.setItem('city-sense-favorites', JSON.stringify(newFavorites));
  };
  
  const removeFavorite = (city: string) => {
    const newFavorites = favorites.filter(c => c !== city);
    setFavorites(newFavorites);
    localStorage.setItem('city-sense-favorites', JSON.stringify(newFavorites));
  };
  
  return { favorites, addFavorite, removeFavorite };
};