import { useState, useEffect } from 'react';
export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        const saved = localStorage.getItem('city-sense-favorites');
        if (saved)
            setFavorites(JSON.parse(saved));
    }, []);
    const addFavorite = (city) => {
        const newFavorites = [...new Set([...favorites, city])];
        setFavorites(newFavorites);
        localStorage.setItem('city-sense-favorites', JSON.stringify(newFavorites));
    };
    const removeFavorite = (city) => {
        const newFavorites = favorites.filter(c => c !== city);
        setFavorites(newFavorites);
        localStorage.setItem('city-sense-favorites', JSON.stringify(newFavorites));
    };
    return { favorites, addFavorite, removeFavorite };
};
//# sourceMappingURL=useFavorites.js.map