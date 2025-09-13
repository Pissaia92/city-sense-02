// frontend/src/components/AppContent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { WeatherRadarMap } from '../components/data/WeatherRadarMap';
// Chakra UI Components
import { 
  Box, 
  Center, 
  Container,
  Flex,
  useColorModeValue,
  IconButton,
  Tooltip,
  Badge
} from '@chakra-ui/react';
// Icons
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
// UI Components
import { LoadingState, ErrorState } from './ui/States';
import { InitialState } from './ui/InitialState';
import { SearchBar } from './search/SearchBar';
// City Components
import { CityHeader } from './city/CityHeader';
import { CityComparison } from './city/CityComparison';
// Data Components
import { MetricsGrid } from './data/MetricsGrid';
import { IQVBreakdown } from './data/IQVBreakdown';
import { ForecastSection } from './data/ForecastSection';
// Types - Import from the correct location
import { IQVData, ForecastPoint } from '../types'; 

interface AppContentProps {
  API_URL: string;
}

export const AppContent: React.FC<AppContentProps> = ({ API_URL }) => {
  // ✅ Correct usage of ThemeContext
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<IQVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState('São Paulo');
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
        // setShowSuggestions(false); // Removed as it's not used
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
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [city, searchTried]);

  // Fetch forecast data
  useEffect(() => {
    if (city) {
      fetchForecast();
      const interval = setInterval(() => {
        fetchForecast();
        if (comparisonCity) fetchForecast(comparisonCity);
      }, 300000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [city, comparisonCity]);

  // Fetch ML prediction
  useEffect(() => {
    if (city && data) {
      fetchMLPrediction();
      const interval = setInterval(fetchMLPrediction, 1800000); // Refresh every 30 minutes
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
        { signal: AbortSignal.timeout(10000) } // 10 second timeout
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
        const result: IQVData = await response.json(); // Explicit typing
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
      console.error('🚨 Error fetching ', err);
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
        { signal: AbortSignal.timeout(10000) } // 10 second timeout
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
        // Explicit typing for the forecast
        setForecast(result.forecast as ForecastPoint[] | undefined ?? null);
        if (cityName === comparisonCity) {
            setComparisonForecast(result.forecast as ForecastPoint[] | undefined ?? null);
        }
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
        { signal: AbortSignal.timeout(15000) } // 15 second timeout
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
        const result: IQVData = await response.json(); // Explicit typing
        setComparisonData(result);
        setComparisonCity(cityName);
      }
    } catch (err) {
      console.error('Error fetching comparison ', err);
      setComparisonData(null);
    }
  };

  // Theme colors - Still using useColorModeValue for base elements
  // But for specific overrides based on our context, we'll use conditionals
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // Determine theme-specific values based on our ThemeContext
  const isDarkMode = theme === 'dark';
  const headerGradient = isDarkMode 
    ? 'linear(to-r, brand.600, brand.800)' 
    : 'linear(to-r, brand.400, brand.600)';
  const iconButtonHoverBg = isDarkMode ? 'brand.700' : 'brand.500';

  if (loading && !data) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(inputCity || 'São Paulo')} />;
  }
  if (!data) {
    return <InitialState onFetchData={fetchData} />;
  }

  // Determine icon and label based on our ThemeContext state
  const themeIcon = isDarkMode ? <SunIcon /> : <MoonIcon />;
  const themeLabel = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Box 
      minH="100vh" 
      bg={bgColor}
      color={textColor}
    >
      {/* Modern Header with Gradient - Using context-based gradient */}
      <Box 
        bgGradient={headerGradient} // ✅ Using context-based value
        py={4}
        boxShadow="sm"
      >
        <Container maxW="container.xl">
          <Flex 
            justify="space-between" 
            align="center"
            py={2}
          >
            <Flex align="center" gap={3}>
              <Box 
                fontSize="2xl" 
                fontWeight="bold"
                color="white"
              >
                🌍 City Sense
              </Box>
              <Badge 
                colorScheme="green" 
                variant="solid"
                fontSize="xs"
                borderRadius="full"
                px={2}
              >
                BETA
              </Badge>
            </Flex>
            {/* ✅ Fixed: Tooltip and IconButton using ThemeContext state */}
            <Tooltip 
              label={themeLabel}
              placement="bottom"
            >
              <IconButton
                onClick={toggleTheme}
                aria-label={themeLabel}
                icon={themeIcon}
                variant="ghost"
                color="white"
                _hover={{
                  bg: iconButtonHoverBg, // ✅ Using context-based value
                  transform: 'scale(1.1)',
                }}
                transition="all 0.2s"
              />
            </Tooltip>
          </Flex>
        </Container>
      </Box>
      
      {/* Search Section with Modern Styling */}
      <Container maxW="container.xl" py={6}>
        <Center>
          <Box w="100%" maxW="xl">
            <SearchBar 
              onSearch={fetchData}
              initialCity={inputCity}
              setInputCity={setInputCity}
              fetchSuggestions={fetchSuggestions}
            />
          </Box>
        </Center>
        
        {/* Main Content */}
        <Box>
          <CityHeader data={data} />
          <MetricsGrid data={data} />
          <IQVBreakdown data={data} />
          <ForecastSection 
            forecast={forecast} 
            mlPrediction={mlPrediction}
          />
          <WeatherRadarMap data={data} />
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
          {/* <CityMap data={data} /> */}
        </Box>
      </Container>
    </Box>
  );
};