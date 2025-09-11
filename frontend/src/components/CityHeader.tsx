import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Flex, 
  Center,
  useColorModeValue
} from '@chakra-ui/react';

interface CityHeaderProps {
  data: any; // Tipagem mais específica pode ser adicionada depois
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

  // Helper function to get weather color
  const getWeatherColor = (description: string) => {
    if (!description) return 'blue.400';
    
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return 'blue.400';
    }
    if (desc.includes('cloud') || desc.includes('nublado')) {
      return 'gray.400';
    }
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) {
      return 'yellow.400';
    }
    if (desc.includes('snow') || desc.includes('neve')) {
      return 'blue.100';
    }
    return 'blue.400';
  };

  // Verificar se data existe antes de acessar propriedades
  if (!data) {
    return (
      <Center py={8}>
        <Box 
          textAlign="center" 
          p={8} 
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl" 
          boxShadow="lg"
          width="100%"
        >
          <Heading size="lg" color={useColorModeValue('gray.700', 'white')}>
            Loading city data...
          </Heading>
        </Box>
      </Center>
    );
  }

  return (
    <Box 
      textAlign="center" 
      p={8} 
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl" 
      mb={8}
      boxShadow="lg"
      border="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'xl',
      }}
    >
      <Flex direction="column" align="center" justify="center" gap={6}>
        {/* Weather Icon and Temperature */}
        <Flex align="center" gap={4}>
          <Box 
            fontSize="5xl" 
            color={getWeatherColor(data.weather?.description || data.description || '')}
            transition="all 0.3s"
            _hover={{
              transform: 'scale(1.1)',
            }}
          >
            {getWeatherIcon(data.weather?.description || data.description || '')}
          </Box>
          
          <Box>
            <Box 
              fontSize="4xl" 
              fontWeight="bold" 
              color={useColorModeValue('gray.800', 'white')}
            >
              {data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A'}
            </Box>
            <Text 
              fontSize="lg" 
              color={useColorModeValue('gray.600', 'gray.400')}
            >
              {data.weather?.description || data.description || 'Loading weather...'}
            </Text>
          </Box>
        </Flex>
        
        {/* City Information */}
        <Box>
          <Heading 
            size="lg" 
            mb={3} 
            color={useColorModeValue('gray.800', 'white')}
          >
            {data.city || 'Loading City'}, {data.country || 'Loading Country'}
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
            Coordinates: {data.latitude?.toFixed(4) || '0'}, {data.longitude?.toFixed(4) || '0'}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};