import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  inputCity: string;
  setInputCity: (value: string) => void;
  onSearch: (city: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  inputCity,
  setInputCity,
  onSearch,
  fetchSuggestions,
  showSuggestions,
  setShowSuggestions,
  searchRef
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (inputCity.trim() && showSuggestions) {
        setIsLoadingSuggestions(true);
        const results = await fetchSuggestions(inputCity);
        setSuggestions(results);
        setIsLoadingSuggestions(false);
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [inputCity, showSuggestions, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      onSearch(inputCity);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputCity(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Digite o nome de uma cidade..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {isLoadingSuggestions ? (
            <div className="suggestion-item">Carregando...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};