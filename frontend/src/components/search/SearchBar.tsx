// src/components/search/SearchBar.tsx

interface SearchBarProps {
  inputCity: string;
  showSuggestions: boolean;
  suggestedCities: string[];
  setInputCity: (city: string) => void;
  setShowSuggestions: (show: boolean) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleCitySelect: (city: string) => void;
  isSearching: boolean;
  darkMode: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  inputCity,
  showSuggestions,
  suggestedCities,
  setInputCity,
  setShowSuggestions,
  handleSearch,
  handleCitySelect,
  isSearching
}) => {
  return (
    <section style={{ 
      marginBottom: '32px',
      position: 'relative'
    }}>
      <div style={{ 
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ 
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={inputCity}
            onChange={(e) => {
              setInputCity(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Digite uma cidade (ex: Nova York, Londres, Tóquio)"            
            style={{
              width: '600px',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              fontSize: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              outline: 'none',
              backgroundColor: 'white'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          {/* City suggestions - agora com mais cidades */}
          {showSuggestions && inputCity && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              marginTop: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 10,
              border: '1px solid #e2e8f0'
            }}>
              {suggestedCities
                .filter(city => 
                  city.toLowerCase().includes(inputCity.toLowerCase())
                )
                .slice(0, 8) // Limitar a 8 sugestões
                .map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {city}
                  </div>
                ))}
              {suggestedCities.filter(city => 
                city.toLowerCase().includes(inputCity.toLowerCase())
              ).length === 0 && (
                <div style={{
                  padding: '12px 16px',
                  color: '#64748b',
                  fontStyle: 'italic'
                }}>
                  Digite o nome de uma cidade e pressione Enter
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          style={{
            padding: '0 24px',
            backgroundColor: isSearching ? '#cbd5e1' : '#0ea5e9',
            color: 'white',
            width: '600px',
            border: 'none',
            borderRadius: '16px',
            height: '52px',
            fontSize: '20px',
            fontWeight: '600',
            cursor: isSearching ? 'wait' : 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: isSearching 
              ? 'none' 
              : '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
          }}
        >
          {isSearching ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Buscando...
            </span>
          ) : 'Buscar'}
        </button>
      </div>
    </section>
  );
};