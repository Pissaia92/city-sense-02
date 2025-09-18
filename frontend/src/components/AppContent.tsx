import React, { useState, useEffect, useRef, useCallback } from 'react';
// Context
import { useTheme } from '../context/ThemeContext';
// Components
import { WeatherRadarMap } from './data/WeatherRadarMap';
import { SearchBar } from './search/SearchBar';
import { MetricsGrid } from './data/MetricsGrid';
import { QoLBreakdown } from './data/QoLBreakdown';
import { ForecastSection } from './data/ForecastSection';
import { CityComparison } from './city/CityComparison';
import { LoadingState, ErrorState } from './ui/States';
import { InitialState } from './ui/InitialState';
// Chakra UI
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  IconButton,
  Tooltip,
  Badge,
  Container,
  Center
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
// Types
import { QoLData, ForecastPoint } from '../types';

interface AppContentProps {
  API_URL: string;
}

export const AppContent: React.FC<AppContentProps> = ({ API_URL }) => {
  // 1. STATE MANAGEMENT
  const [data, setData] = useState<QoLData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState('São Paulo');
  const [forecast, setForecast] = useState<ForecastPoint[] | null>(null);
  const [comparisonCity, setComparisonCity] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<QoLData | null>(null);
  const [showComparisonSuggestions, setShowComparisonSuggestions] = useState(false);
  const [comparisonForecast, setComparisonForecast] = useState<ForecastPoint[] | null>(null);
  const [searchTried, setSearchTried] = useState(false);
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  // Refs
  const comparisonSearchRef = useRef<HTMLDivElement>(null);
  // 2. CONTEXTS
  const { theme, toggleTheme } = useTheme();  
  // 3. EFFECTS
  // Handle click outside for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target as Node)) {
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // empty deps executed only 1x

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

  // 4. CALLBACKS
  const fetchData = useCallback(async (cityName: string) => {
    const formattedCity = cityName.trim();
    if (!formattedCity) return;
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Fetching data for: ${formattedCity}`);
      const response = await fetch(
        `${API_URL}/api/QoL?city=${encodeURIComponent(formattedCity)}`,
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
        const result: QoLData = await response.json(); // Explicit typing
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
  }, [API_URL]); // API_URL as dependency

  const fetchForecast = useCallback(async (cityName?: string) => {
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
  }, [API_URL, city, comparisonCity]); // Dep

  const fetchMLPrediction = useCallback(async () => {
    if (!city) return;
    try {
      const response = await fetch(
        `${API_URL}/api/predict/QoL?city=${encodeURIComponent(city)}`,
        { signal: AbortSignal.timeout(15000) } // 15 second timeout
      );
      if (response.ok) {
        const result = await response.json();
        setMlPrediction(result);
      }
    } catch (err) {
      console.error('Error fetching ML forecast:', err);
    }
  }, [API_URL, city]); // Dependências

  const fetchSuggestions = useCallback(async (query: string) => {
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
  }, [API_URL]);

  const fetchComparisonData = useCallback(async (cityName: string) => {
    if (!cityName.trim()) {
      setComparisonData(null);
      setComparisonForecast(null);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/QoL?city=${encodeURIComponent(cityName)}`);
      if (response.ok) {
        const result: QoLData = await response.json(); // Explicit typing
        setComparisonData(result);
        setComparisonCity(cityName);
      }
    } catch (err) {
      console.error('Error fetching comparison ', err);
      setComparisonData(null);
    }
  }, [API_URL]);

  // 5. THEME COLORS
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const headerGradient = useColorModeValue(
    'linear(to-r, brand.400, brand.600)',
    'linear(to-r, brand.600, brand.800)'
  );
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const highlightColor = useColorModeValue('blue.600', 'blue.300');

  // 6. RENDER LOGIC
  if (loading && !data) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(inputCity || 'São Paulo')} />;
  }
  if (!data) {
    return <InitialState onFetchData={fetchData} />;
  }

  const themeIcon = theme === 'dark' ? <SunIcon /> : <MoonIcon />;
  const themeLabel = theme === 'dark' ? "Switch to light mode" : "Switch to dark mode";

  // Process weather description
  const weatherDescription = data.weather?.description || '';
  let conditionText = 'Unknown';
  if (weatherDescription) {
    conditionText = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    switch (weatherDescription.toLowerCase()) {
      case 'broken clouds': conditionText = 'Partly Cloudy'; break;
      case 'few clouds': conditionText = 'Mostly Sunny'; break;
      case 'clear sky': conditionText = 'Clear Sky'; break;
      case 'scattered clouds': conditionText = 'Scattered Clouds'; break;
      case 'shower rain': conditionText = 'Shower Rain'; break;
      case 'rain': conditionText = 'Rain'; break;
      case 'thunderstorm': conditionText = 'Thunderstorm'; break;
      case 'snow': conditionText = 'Snow'; break;
      case 'mist': conditionText = 'Mist'; break;
      // Space for more, if needed
    }
  }

  // Pop format
  const formatPopulation = (pop?: number) => {
    if (pop === undefined || pop === null) return 'N/A';
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`;
    }
    if (pop >= 1000) {
      return `${(pop / 1000).toFixed(1)}k`;
    }
    return pop.toString();
  };

  // Coord format
  const formatCoordinates = (lat?: number, lon?: number) => {
    if (lat === undefined || lon === undefined) return 'N/A';
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  // Local time format
  const formatLocalTime = () => {
    if (!data.timestamp) return 'N/A';
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box 
      minH="100vh" 
      bg={bgColor}
      color={textColor}
    >
      {/* Modern Header with Gradient */}
      <Box 
        bgGradient={headerGradient}
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
          <Box
            bg={useColorModeValue('gray.100', 'gray.700')}
            borderRadius="lg"
            p={{ base: 3, sm: 4 }}
            shadow="md"
            mb={6}
            maxW="2xl"
            mx="auto"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex direction="column" align="center">
              {/* Line 1: Localization */}
              <Flex align="center" gap={2} mb={2}>
                <Icon as={FaMapMarkerAlt} color={textColor} boxSize={4} />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  {data.city}, {data.country}
                </Text>
              </Flex>

              {/* Line 2: Temp and condition */}
              <Flex align="center" gap={3} mb={2}>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor}>
                  {data.temperature.toFixed(1)}°C
                </Text>
                {data.weather?.description && (
                  <Text fontSize="sm" color={subtitleColor}>
                    {conditionText}
                  </Text>
                )}
              </Flex>

              {/* Line 3: Pop, Coord, time */}
              <Flex justify="center" align="center" wrap="wrap" gap={4} mb={2} fontSize="xs">
                {data.population !== undefined && data.population !== null && (
                  <Flex align="center" gap={1}>
                    <Icon as={FaUsers} color={highlightColor} boxSize={3} />
                    <Text color={subtitleColor}>{formatPopulation(data.population)}</Text>
                  </Flex>
                )}
                {data.latitude !== undefined && data.latitude !== null && data.longitude !== undefined && data.longitude !== null && (
                  <Flex align="center" gap={1}>
                    <Icon as={FaMapMarkerAlt} color={highlightColor} boxSize={3} />
                    <Text color={subtitleColor}>{formatCoordinates(data.latitude, data.longitude)}</Text>
                  </Flex>
                )}
                {data.timestamp && (
                  <Flex align="center" gap={1}>
                    <Icon as={FaClock} color={highlightColor} boxSize={3} />
                    <Text color={subtitleColor}>Updated: {formatLocalTime()}</Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Box>
          
          {/* Act used comps */}
          <MetricsGrid data={data} />
          <QoLBreakdown data={data} />
          <ForecastSection 
            forecast={forecast} 
            // mlPrediction={mlPrediction}
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
        </Box>
      </Container>
    </Box>
  );
};