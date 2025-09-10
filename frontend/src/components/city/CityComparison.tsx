import React, { useState, useRef } from 'react';

interface CityComparisonProps {
  comparisonCity: string;
  setComparisonCity: (city: string) => void;
  comparisonData: any;
  comparisonForecast: any;
  fetchComparisonData: (city: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  showComparisonSuggestions: boolean;
  setShowComparisonSuggestions: (show: boolean) => void;
  comparisonSearchRef: React.RefObject<HTMLDivElement>;
}

export const CityComparison: React.FC<CityComparisonProps> = ({
  comparisonCity,
  setComparisonCity,
  comparisonData,
  comparisonForecast,
  fetchComparisonData,
  fetchSuggestions,
  showComparisonSuggestions,
  setShowComparisonSuggestions,
  comparisonSearchRef
}) => {
  const [comparisonInput, setComparisonInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Handle input change with debounced suggestions
  const handleInputChange = (value: string) => {
    setComparisonInput(value);
    setShowComparisonSuggestions(true);
    
    if (value.trim()) {
      setLoadingSuggestions(true);
      // In a real app, you would call fetchSuggestions here
      setTimeout(() => {
        setLoadingSuggestions(false);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Handle comparison search
  const handleComparisonSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (comparisonInput.trim()) {
      fetchComparisonData(comparisonInput);
      setShowComparisonSuggestions(false);
    }
  };

  return (
    <div className="comparison-section">
      <h3>City Comparison</h3>
      <div className="comparison-input-container" ref={comparisonSearchRef}>
        <input
          type="text"
          value={comparisonInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowComparisonSuggestions(true)}
          placeholder="Enter city to compare..."
          className="comparison-input"
        />
        <button 
          onClick={handleComparisonSearch}
          className="comparison-button"
        >
          Compare
        </button>
      </div>
      
      {showComparisonSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {loadingSuggestions ? (
            <div className="suggestion-item">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setComparisonInput(suggestion);
                  fetchComparisonData(suggestion);
                  setShowComparisonSuggestions(false);
                }}
              >
                {suggestion}
              </div>
            ))
          )}
        </div>
      )}
      
      {comparisonData && (
        <div className="comparison-results">
          <div className="comparison-card">
            <div className="comparison-title">
              {comparisonData.city}, {comparisonData.country}
            </div>
            <div className="comparison-metric">
              IQV: {comparisonData.iqv_components?.overall?.toFixed(1) || 'N/A'}
            </div>
            <div className="comparison-temp">
              Temp: {comparisonData.temperature?.toFixed(1) || 'N/A'}°C
            </div>
          </div>
        </div>
      )}
    </div>
  );
};