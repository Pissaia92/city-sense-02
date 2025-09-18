import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaUsers, FaClock, FaSun, FaCloud, FaCloudRain } from 'react-icons/fa';
import { QoLData } from '../../types';

interface CityHeaderProps {
  data: QoLData;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Color mode responsive colors
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.600', 'blue.300');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // Process weather description
  const weatherDescription = data.weather?.description || '';
  let conditionText = 'Unknown';
  if (weatherDescription) {
    conditionText = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    switch (weatherDescription.toLowerCase()) {
      case 'broken clouds': 
        conditionText = 'Partly Cloudy'; 
        break;
      case 'few clouds': 
        conditionText = 'Mostly Sunny'; 
        break;
      case 'clear sky': 
        conditionText = 'Clear Sky'; 
        break;
      case 'scattered clouds': 
        conditionText = 'Scattered Clouds'; 
        break;
      case 'shower rain': 
        conditionText = 'Shower Rain'; 
        break;
      case 'rain': 
        conditionText = 'Rain'; 
        break;
      case 'thunderstorm': 
        conditionText = 'Thunderstorm'; 
        break;
      case 'snow': 
        conditionText = 'Snow'; 
        break;
      case 'mist': 
        conditionText = 'Mist'; 
        break;
    }
  }

  // Format population
  const formatPopulation = (pop?: number) => {
    if (pop === undefined || pop === null) return 'N/A';
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M population`;
    }
    if (pop >= 1000) {
      return `${(pop / 1000).toFixed(1)}k population`;
    }
    return pop.toString();
  };

  // Format local time
  const formatLocalTime = () => {
    if (!data.timestamp) return 'N/A';
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format last update timestamp
  const formatLastUpdate = () => {
    if (!data.timestamp) return 'N/A';
    const date = new Date(data.timestamp);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get weather icon based on description
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
      {/* City name and country */}
      <Flex align="center" gap={2} mb={2}>
        <Icon as={FaMapMarkerAlt} color={textColor} boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          {data.city}, {data.country}
        </Text>
      </Flex>

      {/* Weather icon and description */}
      <Flex align="center" gap={2} mb={2}>
        <Icon
          as={getWeatherIcon(weatherDescription)}
          color={highlightColor}
          boxSize={6}
        />
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          {conditionText}
        </Text>
      </Flex>

      {/* Population, local time and last update */}
      <Flex 
        justify="center" 
        align="center" 
        wrap="wrap" 
        gap={4} 
        mb={2} 
        fontSize="xs"
      >
        {data.population !== undefined && data.population !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaUsers} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatPopulation(data.population)}</Text>
          </Flex>
        )}

        {data.timestamp && (
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatLocalTime()}</Text>
          </Flex>
        )}

        {data.timestamp && (
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>Updated: {formatLastUpdate()}</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};