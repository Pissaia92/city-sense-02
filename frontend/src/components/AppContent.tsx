import React, { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// UI Components
import { LoadingState, ErrorState } from './ui/States';
import { InitialState } from './ui/InitialState';

// City Components
import { CityHeader } from './city/CityHeader';
import { CityComparison } from './city/CityComparison';
import { CityMap } from './city/CityMap';

// Data Components
import { MetricsGrid } from './data/MetricsGrid';
import { IQVBreakdown } from './data/IQVBreakdown';
import { ForecastSection } from './data/ForecastSection';

// Types
interface ForecastPoint {
  datetime: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

interface IQVData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  iqv_components: {
    temperature: number;
    humidity: number;
    wind: number;
    overall: number;
  };
  timestamp: string;
  latitude: number;
  longitude: number;
  weather?: {
    description: string;
  };
}

interface AppContentProps {
  API_URL: string;
}

export const AppContent: React.FC<AppContentProps> = ({ API_URL }) => {
  const { darkMode } = useContext(ThemeContext);
  const [data, setData] = useState<IQVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState('São Paulo');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [forecast, setForecast] = useState<ForecastPoint[] | null>(null);
  const [comparisonCity, setComparisonCity] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<IQVData | null>(null);
  const [comparisonForecast, setComparisonForecast] = useState<ForecastPoint[] | null>(null);
  const [showComparisonSuggestions, setShowComparisonSuggestions] = useState(false);
  const [searchTried, setSearchTried] = useState(false);
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const comparisonSearchRef = useRef<HTMLDivElement>(null);

  // Handle click outside for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target as Node)) {
        setShowComparisonSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!searchTried) {
      fetchData('São Paulo');
    }
    
    const interval = setInterval(() => {
      if (city) fetchData(city);
    }, 60000);

    return () => clearInterval(interval);
  }, [city, searchTried]);

  // Fetch forecast data
  useEffect(() => {
    if (city) {
      fetchForecast();
      
      const interval = setInterval(() => {
        fetchForecast();
        if (comparisonCity) fetchForecast(comparisonCity);
      }, 300000);

      return () => clearInterval(interval);
    }
  }, [city, comparisonCity]);

  // Fetch ML prediction
  useEffect(() => {
    if (city && data) {
      fetchMLPrediction();
      
      const interval = setInterval(fetchMLPrediction, 1800000);
      return () => clearInterval(interval);
    }
  }, [city, data]);

  const fetchData = async (cityName: string) => {
    const formattedCity = cityName.trim();
    if (!formattedCity) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching data for: ${formattedCity}`);
      
      const response = await fetch(
        `${API_URL}/api/iqv?city=${encodeURIComponent(formattedCity)}`,
        { signal: AbortSignal.timeout(10000) }
      );

      console.log(`📊 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Error response text: ${errorText}`);
        
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        if (response.status === 404) {
          setError(`❌ City "${formattedCity}" not found. Check the name and try again.`);
        } else {
          setError(`⚠️ ${errorMessage}`);
        }
        setData(null);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log('✅ Data received:', result);
        setData(result);
        setCity(formattedCity);
        setSearchTried(true);
      } else {
        const textResponse = await response.text();
        console.error('❌ Expected JSON but received:', textResponse);
        setError('⚠️ Invalid response format from server');
        setData(null);
      }
    } catch (err: any) {
      console.error('🚨 Error fetching data:', err);
      if (err.name === 'AbortError') {
        setError('⏳ Timeout exceeded. Please try again.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('🔌 Connection error. Please check if the backend is running.');
      } else {
        setError(`⚠️ ${err.message || 'Unexpected error loading data'}`);
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName?: string) => {
    const cityToFetch = cityName || city;
    if (!cityToFetch) return;

    try {
      console.log(`🔍 Fetching forecast for: ${cityToFetch}`);
      
      const response = await fetch(
        `${API_URL}/api/forecast?city=${encodeURIComponent(cityToFetch)}`,
        { signal: AbortSignal.timeout(10000) }
      );

      console.log(`📊 Forecast response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Forecast error: ${errorText}`);
        if (cityName === comparisonCity) setComparisonForecast(null);
        else setForecast(null);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log('🌤️ Loaded forecast:', result.forecast);
        if (cityName === comparisonCity) setComparisonForecast(result.forecast);
        else setForecast(result.forecast);
      } else {
        const textResponse = await response.text();
        console.error('❌ Expected JSON forecast but received:', textResponse);
      }
    } catch (err) {
      console.error('⚠️ Error fetching forecast:', err);
      if (cityName === comparisonCity) setComparisonForecast(null);
      else setForecast(null);
    }
  };

  const fetchMLPrediction = async () => {
    if (!city) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/predict/iqv?city=${encodeURIComponent(city)}`,
        { signal: AbortSignal.timeout(15000) }
      );

      if (response.ok) {
        const result = await response.json();
        setMlPrediction(result);
      }
    } catch (err) {
      console.error('Error fetching ML forecast:', err);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(`${API_URL}/api/suggestions?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const result = await response.json();
        return result.suggestions || [];
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
    return [];
  };

  const fetchComparisonData = async (cityName: string) => {
    if (!cityName.trim()) {
      setComparisonData(null);
      setComparisonForecast(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/iqv?city=${encodeURIComponent(cityName)}`);
      if (response.ok) {
        const result = await response.json();
        setComparisonData(result);
        setComparisonCity(cityName);
      }
    } catch (err) {
      console.error('Error fetching comparison ', err);
      setComparisonData(null);
    }
  };

  if (loading && !data) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(inputCity || 'São Paulo')} />;
  }

  if (!data) {
    return <InitialState onFetchData={fetchData} />;
  }

  return (
    <div className="app-content">
      <header className="app-header">
        <div className="header-content">
          <h1>🌍 City Sense</h1>
          <div className="header-controls">
            <button 
              onClick={() => {}}
              className="theme-toggle"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="city-info">
          <h2>{data.city}, {data.country}</h2>
          <p>Updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </header>
      
      <div className="search-container" ref={searchRef}>
        <form onSubmit={(e) => { e.preventDefault(); fetchData(inputCity); }} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter city name..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </div>
        </form>
      </div>

      <CityHeader data={data} />
      
      <MetricsGrid data={data} />
      
      <IQVBreakdown data={data} />

      <ForecastSection 
        forecast={forecast} 
        mlPrediction={mlPrediction}
      />

      <CityComparison
        comparisonCity={comparisonCity}
        setComparisonCity={setComparisonCity}
        comparisonData={comparisonData}
        comparisonForecast={comparisonForecast}
        fetchComparisonData={fetchComparisonData}
        fetchSuggestions={fetchSuggestions}
        showComparisonSuggestions={showComparisonSuggestions}
        setShowComparisonSuggestions={setShowComparisonSuggestions}
        comparisonSearchRef={comparisonSearchRef}
      />

      <CityMap data={data} />
    </div>
  );
};