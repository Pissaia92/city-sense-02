import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
import { FaSun, FaCloud, FaCloudRain } from 'react-icons/fa'; 
import { IQVData } from '../../types';

interface CityHeaderProps {
  data: IQVData;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // dark/light colors rection
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.600', 'blue.300');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // Weather description process
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
      // Can add more itens...
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

  // Coordinates format
  const formatCoordinates = (lat?: number, lon?: number) => {
    if (lat === undefined || lon === undefined) return 'N/A';
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  return (
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
      {/* City - Country - Icon */}
      <Flex align="center" gap={2} mb={2}>
        <Icon as={FaMapMarkerAlt} color={textColor} boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          {data.city}, {data.country}
        </Text>
        {data.weather && (
          <Flex align="center" gap={1} ml={2}>
            <Icon 
              as={getWeatherIcon(weatherDescription)} 
              color={highlightColor} 
              boxSize={4} 
            />
            <Text fontSize="sm" color={secondaryTextColor}>
              {conditionText}
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Line 2 - temperature - condition */}
      <Flex align="center" gap={3} mb={2}>
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor}>
          {data.temperature.toFixed(1)}°C
        </Text>
        {data.weather?.description && (
          <Text fontSize="sm" color={secondaryTextColor}>
            {conditionText}
          </Text>
        )}
      </Flex>

      {/* Line 3: Pop, coordinates, time */}
      <Flex justify="center" align="center" wrap="wrap" gap={4} mb={2} fontSize="xs">
        {data.population !== undefined && data.population !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaUsers} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatPopulation(data.population)}</Text>
          </Flex>
        )}
        {data.latitude !== undefined && data.latitude !== null && data.longitude !== undefined && data.longitude !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaMapMarkerAlt} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatCoordinates(data.latitude, data.longitude)}</Text>
          </Flex>
        )}
        {data.timestamp && (
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>Updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

// Weather icon moved out
const getWeatherIcon = (description: string) => {
  if (!description) return FaSun;
  const desc = description.toLowerCase();
  if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
    return FaCloudRain;
  }
  if (desc.includes('cloud') || desc.includes('nublado')) {
    return FaCloud;
  }
  if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) {
    return FaSun;
  }
  return FaSun;
};