import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { fetchIQVData } from './api/api';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchBar } from './components/search/SearchBar';
import { LoadingState, ErrorState } from './components/State/States';
import { CityHeader } from './components/CityHeader';
import { CityMap } from './components/CityMap';
import { CityComparison } from './components/CityComparison';
import { MetricsGrid } from './components/MetricsGrid';
import { IQVTips } from './components/IQVTips';
import { IQVBreakdown } from './components/IQVBreakdown';
import ForecastChart from './components/ForecastChart';
import type { ForecastPoint } from 'components/Types/types';
import NotificationSystem from './components/NotificationSystem';
import { WeatherAlerts } from './components/WeatherAlerts';
import { ThemeContext } from './context/ThemeContext';
import { DateTime } from 'luxon';

// --- Type Definitions ---
interface IQVData {
  city: string;
  temperature: number;
  humidity: number;
  traffic_delay: number;
  aqi: number;
  safety_index: number;
  temp_normalized: number;
  humidity_score: number;
  traffic_score: number;
  predicted_iqv: number;
  timestamp: string; // ISO string
}

// --- Metric Interface Definition ---
interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
  icon?: string;
  color?: string;
}

// --- Main Application Component ---
const AppContent = () => {
  // --- Hooks and Context ---
  const { darkMode } = useContext(ThemeContext);

  // --- State Management ---
  const [data, setData] = useState<IQVData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState<string>('São Paulo');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [comparisonCities, setComparisonCities] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[] | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- State for transformed metrics ---
  const [metricsData, setMetricsData] = useState<Metric[]>([]);

  const fetchForecastData = useCallback(async (cityName: string) => {
    const API_URL = 'http://localhost:8000'; // Or use import.meta.env.VITE_API_URL
    if (!cityName) {
      setForecastData(null);
      return;
    }

    try {
      console.log(`🌤️ Fetching forecast for: ${cityName}`);
      const response = await fetch(
        `${API_URL}/api/forecast?city=${encodeURIComponent(cityName)}`,
        {
          signal: AbortSignal.timeout(8000) // 8 second timeout
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `Error ${response.status}: ${response.statusText}`;
        console.warn('⚠️ Forecast not available:', errorMessage);
        setForecastData(null);
        return;
      }

      const result = await response.json();
      console.log('🌤️ Loaded forecast:', result.forecast);
      setForecastData(result.forecast || []);
    } catch (err: any) {
      console.error('⚠️ Error fetching forecast:', err);
      if (err.name === 'AbortError') {
        console.warn('⚠️ Forecast request timed out');
      }
      setForecastData(null);
    }
  }, []);

  // --- Helper function to format traffic delay ---
  const formatTrafficDelay = (delayInMinutes: number): string => {
    if (delayInMinutes < 1) return '< 1 min';
    if (delayInMinutes < 60) return `${Math.round(delayInMinutes)} min`;
    const hours = Math.floor(delayInMinutes / 60);
    const minutes = Math.round(delayInMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  // --- Function to transform data into metrics ---
  const transformDataToMetrics = useCallback(
    (apiData: IQVData | null): Metric[] => {
      if (!apiData) return [];

      const normalizedHumidityForClimate = apiData.humidity_score / 6;
      const climateQualityValue = (apiData.temp_normalized * 0.6 + normalizedHumidityForClimate * 0.4) * 10;
      const formattedTrafficDelay = formatTrafficDelay(apiData.traffic_delay);

      return [
        {
          name: 'General QoL',
          value: apiData.predicted_iqv,
          unit: '/100',
          description: 'Predicted general Quality of Life index.'
        },
        {
          name: 'Temperature',
          value: apiData.temperature,
          unit: '°C',
          description: 'Current temperature.'
        },
        {
          name: 'Humidity',
          value: apiData.humidity,
          unit: '%',
          description: 'Relative air humidity.'
        },
        {
          name: 'Climate Quality',
          value: parseFloat(climateQualityValue.toFixed(2)),
          unit: '/10',
          description: 'Climate quality assessment based on temperature and humidity.'
        },
        {
          name: 'Traffic Delay',
          value: formattedTrafficDelay,
          unit: '',
          description: 'Average traffic delay.'
        },
        {
          name: 'Air Quality',
          value: apiData.aqi,
          unit: 'AQI',
          description: 'Air Quality Index.'
        },
        {
          name: 'Safety',
          value: apiData.safety_index,
          unit: '/10',
          description: 'City safety index.'
        }
      ];
    },
    [formatTrafficDelay]
  );

  // --- Update metricsData when 'data' changes ---
  useEffect(() => {
    setMetricsData(transformDataToMetrics(data));
  }, [data, transformDataToMetrics]);

  // --- Update comparison cities ---
  useEffect(() => {
    if (data?.city) {
      setComparisonCities([data.city, 'Rio de Janeiro', 'Belo Horizonte']);
    }
  }, [data?.city]);

  // --- Function to fetch data from API ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCity.trim()) {
      setError('Insert a City name.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const fetchedData: IQVData = await fetchIQVData(inputCity);
      setData(fetchedData);
      await fetchForecastData(inputCity);
    } catch (err: any) {
      console.error('API Error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('conection')) {
        setError('Error connecting to the server...');
      } else if (err.message.includes('404')) {
        setError(`Data for '${inputCity}' was not found.`);
      } else {
        setError(err.message || 'Failed getting data. Try again.');
      }
      setData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Function to select a suggestion ---
  const handleSelectSuggestion = (suggestion: string) => {
    setInputCity(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 0);
  };

  // --- Load initial data ---
  useEffect(() => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Close suggestions when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Helper functions for CityHeader ---
  const dataFormatada = data
    ? DateTime.fromISO(data.timestamp)
        .setZone('America/Sao_Paulo')
        .toFormat("dd/MM/yyyy 'at' HH:mm")
    : '';

  const getWeatherIcon = () => {
    if (!data) return '🌤️';
    if (data.temperature > 30) return '🔥';
    if (data.temperature > 25) return '☀️';
    if (data.temperature > 15) return '⛅';
    if (data.temperature > 5) return '☁️';
    return '❄️';
  };

  // --- Render ---
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Header */}
        <Header darkMode={darkMode} data={data} city={data?.city || inputCity} />

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-8">
          <SearchBar
            inputCity={inputCity}
            showSuggestions={showSuggestions}
            suggestedCities={[]}
            setInputCity={setInputCity}
            setShowSuggestions={setShowSuggestions}
            handleSearch={handleSearch}
            handleCitySelect={handleSelectSuggestion}
            isSearching={loading}
            darkMode={darkMode}
            searchRef={searchRef}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 pb-16">
          {/* Loading State */}
          {loading && <LoadingState darkMode={darkMode} />}

          {/* Error State */}
          {error && !loading && (
            <ErrorState
              error={error}
              darkMode={darkMode}
              onRetry={() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSearch(fakeEvent);
              }}
            />
          )}

          {/* Main Content (City Data) */}
          {!loading && data && (
            <div className="space-y-8">
              {/* CityHeader */}
              <CityHeader
                darkMode={darkMode}
                data={data}
                dataFormatada={dataFormatada}
                getWeatherIcon={getWeatherIcon}
              />

              {/* MetricsGrid */}
              <MetricsGrid darkMode={darkMode} metrics={metricsData} />

              {/* IQVBreakdown */}
              {data && (
                <IQVBreakdown
                  darkMode={darkMode}
                  data={{
                    city: data.city,
                    temperature: data.temperature,
                    humidity: data.humidity,
                    avg_traffic_delay_min: data.traffic_delay,
                    iqv_climate: parseFloat(
                      ((data.temp_normalized * 0.5 + (data.humidity_score / 6) * 0.5) * 10).toFixed(2)
                    ),
                    iqv_humidity: parseFloat(((data.humidity_score / 6) * 10).toFixed(2)),
                    iqv_traffic: data.traffic_score,
                    iqv_trend: 5 // Placeholder
                  }}
                />
              )}

              {/* ForecastChart */}
              <ForecastChart darkMode={darkMode} data={forecastData} />

              {/* CityComparison - Adapted for Local API and Functional */}
              <CityComparison cities={comparisonCities} darkMode={darkMode} shouldFetch={true} />

              {/* CityMap - Adapted and Functional */}
              <CityMap city={data.city} temperature={data.temperature} iqv={data.predicted_iqv} />

              {/* NotificationSystem - Check props in component */}
              <NotificationSystem />

              {/* WeatherAlerts */}
              <WeatherAlerts alerts={[]} />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

const App = () => <AppContent />;

export default App;