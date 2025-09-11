import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Badge,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { FiSun, FiCloud, FiCloudRain, FiWind, FiDroplet, FiThermometer } from 'react-icons/fi';

interface ForecastPoint {
  datetime: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

interface ForecastSectionProps {
  forecast: ForecastPoint[] | null;
  mlPrediction: any;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast, mlPrediction }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  
  // Função para obter ícone do clima
  const getWeatherIcon = (description: string) => {
    if (!description) return FiSun;
    
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return FiCloudRain;
    }
    if (desc.includes('cloud') || desc.includes('nublado')) {
      return FiCloud;
    }
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) {
      return FiSun;
    }
    return FiSun;
  };

  // Função para obter cor do clima
  const getWeatherColor = (description: string) => {
    if (!description) return 'yellow.400';
    
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
    return 'yellow.400';
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!forecast) {
    return (
      <Card 
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        boxShadow="lg"
        mb={8}
      >
        <CardBody>
          <Heading size="md" mb={4} color={textColor}>5-Day Forecast</Heading>
          <Text color={subtitleColor}>Loading forecast data...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      boxShadow="lg"
      mb={8}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
    >
      <CardBody>
        <Heading size="md" mb={6} color={textColor} textAlign="center">
          5-Day Weather Forecast
        </Heading>
        
        <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4}>
          {forecast.slice(0, 5).map((point, index) => (
            <Card 
              key={index} 
              bg={useColorModeValue('gray.50', 'gray.700')}
              border="1px"
              borderColor={borderColor}
              transition="all 0.2s"
              _hover={{ 
                bg: useColorModeValue('gray.100', 'gray.600'),
                transform: 'translateY(-3px)'
              }}
            >
              <CardBody>
                <Text 
                  fontWeight="bold" 
                  color={textColor} 
                  textAlign="center" 
                  mb={2}
                >
                  {formatDate(point.datetime)}
                </Text>
                
                <Flex justify="center" mb={3}>
                  <Tooltip label={point.description} placement="top">
                    <Icon 
                      as={getWeatherIcon(point.description)} 
                      color={getWeatherColor(point.description)} 
                      boxSize={8}
                    />
                  </Tooltip>
                </Flex>
                
                <Flex align="center" justify="center" mb={2}>
                  <Icon as={FiThermometer} color="red.400" boxSize={4} mr={1} />
                  <Text fontWeight="bold" color={textColor}>
                    {point.temperature?.toFixed(1)}°C
                  </Text>
                </Flex>
                
                <Flex align="center" justify="center" mb={2}>
                  <Icon as={FiWind} color="gray.400" boxSize={4} mr={1} />
                  <Text fontSize="sm" color={subtitleColor}>
                    {point.wind_speed?.toFixed(1)} m/s
                  </Text>
                </Flex>
                
                <Flex align="center" justify="center">
                  <Icon as={FiDroplet} color="blue.400" boxSize={4} mr={1} />
                  <Text fontSize="sm" color={subtitleColor}>
                    {point.humidity?.toFixed(0)}%
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        
        {mlPrediction && (
          <Box 
            mt={6} 
            p={4} 
            bg={useColorModeValue('purple.50', 'purple.900')}
            borderRadius="lg"
            border="1px"
            borderColor={useColorModeValue('purple.200', 'purple.700')}
          >
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold" color={useColorModeValue('purple.800', 'purple.200')}>
                ML Prediction Available
              </Text>
              <Badge colorScheme="purple">AI</Badge>
            </Flex>
            <Text fontSize="sm" color={useColorModeValue('purple.700', 'purple.300')} mt={1}>
              Next 7 days trend prediction
            </Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};