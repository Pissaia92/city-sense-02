import React, { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { WeatherRadarMap } from '../components/data/WeatherRadarMap.tsx';

// Chakra UI Components
import { 
  Box, 
  Center, 
  Container,
  Flex,
  Heading,
  Text,
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
// import { CityMap } from './city/CityMap';

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
  description?: string;
}

interface AppContentProps {
  API_URL: string;
}

export const AppContent: React.FC<AppContentProps> = ({ API_URL }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
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
        // setShowSuggestions(false); // Removido pois não está sendo usado
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

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

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
    <Box 
      minH="100vh" 
      bg={bgColor}
      color={textColor}
    >
      {/* Modern Header with Gradient */}
      <Box 
        bgGradient={useColorModeValue(
          'linear(to-r, brand.400, brand.600)', 
          'linear(to-r, brand.600, brand.800)'
        )}
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
            
            <Tooltip 
              label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              placement="bottom"
            >
              <IconButton
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                icon={darkMode ? <SunIcon /> : <MoonIcon />}
                variant="ghost"
                color="white"
                _hover={{
                  bg: useColorModeValue('brand.500', 'brand.700'),
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