import React from 'react';
import { Box, Heading, Text, Flex, Center } from '@chakra-ui/react';

interface CityHeaderProps {
  data: any;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Helper function to get weather icon based on description
  const getWeatherIcon = (description: string) => {
    // Check if description exists before calling toLowerCase
    if (!description) return '🌤️';
    
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return '⛈️';
    }
    if (desc.includes('cloud') || desc.includes('nublado')) {
      return '☁️';
    }
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) {
      return '☀️';
    }
    if (desc.includes('snow') || desc.includes('neve')) {
      return '❄️';
    }
    return '🌤️';
  };

  // Verificar se data existe antes de acessar propriedades
  if (!data) {
    return (
      <Center py={8}>
        <Box 
          textAlign="center" 
          p={6} 
          bg="gray.50" 
          borderRadius="lg" 
          boxShadow="md"
          width="100%"
        >
          <Heading size="lg" color="gray.700">
            Loading city data...
          </Heading>
        </Box>
      </Center>
    );
  }

  return (
    <Box 
      textAlign="center" 
      p={6} 
      bg="gray.50" 
      borderRadius="lg" 
      mb={6}
      boxShadow="md"
      width="100%"
    >
      <Flex direction="column" align="center" justify="center">
        <Box fontSize="4xl" mb={3}>
          {getWeatherIcon(data.weather?.description || data.description || '')}
        </Box>
        
        <Box fontSize="3xl" fontWeight="bold" mb={3} color="gray.800">
          {data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A'}
        </Box>
        
        <Text fontSize="lg" mb={4} color="gray.600">
          {data.weather?.description || data.description || 'Loading weather...'}
        </Text>
        
        <Box>
          <Heading size="md" mb={2} color="gray.800">
            {data.city || 'Loading City'}, {data.country || 'Loading Country'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Coordinates: {data.latitude?.toFixed(4) || '0'}, {data.longitude?.toFixed(4) || '0'}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};