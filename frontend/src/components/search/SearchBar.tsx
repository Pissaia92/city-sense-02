// frontend/src/components/search/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  inputCity: string;
  showSuggestions: boolean;
  suggestedCities: string[];
  setInputCity: React.Dispatch<React.SetStateAction<string>>;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (e: React.FormEvent) => void;
  handleCitySelect: (city: string) => void;
  isSearching: boolean;
  darkMode: boolean;
  searchRef?: React.RefObject<HTMLDivElement>;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSuggestion?: (suggestion: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  inputCity,
  showSuggestions,
  suggestedCities,
  setInputCity,
  setShowSuggestions,
  handleSearch,
  handleCitySelect,
  isSearching,
  darkMode,
  searchRef,
  onInputChange,
  onSelectSuggestion
}) => {
  return (
    <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
      <div ref={searchRef} style={{ position: 'relative' }}>
        <input
          type="text"
          value={inputCity}
          onChange={(e) => {
            setInputCity(e.target.value);
            if (onInputChange) onInputChange(e);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Digite o nome da cidade..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
            color: darkMode ? '#e2e8f0' : '#1e293b',
            fontSize: '1rem',
            marginBottom: '8px'
          }}
        />
        
        {/* Sugestões de cidades */}
        {showSuggestions && suggestedCities.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '6px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px'
          }}>
            {suggestedCities.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => {
                  setInputCity(suggestion);
                  setShowSuggestions(false);
                  if (onSelectSuggestion) {
                    onSelectSuggestion(suggestion);
                  } else {
                    handleCitySelect(suggestion);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSearching}
        style={{
          padding: '10px 20px',
          backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isSearching ? 'not-allowed' : 'pointer',
          fontWeight: '600'
        }}
      >
        {isSearching ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
};

export { SearchBar };