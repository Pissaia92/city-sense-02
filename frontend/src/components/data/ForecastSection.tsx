import React from 'react';
import { 
  Flex, 
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { ForecastPoint } from '../../types'; 
import { FiSun, FiCloud, FiCloudRain, FiWind, FiDroplet, FiThermometer } from 'react-icons/fi';

interface ForecastSectionProps {
  forecast: ForecastPoint[] | null;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Forecast data maint to avoid repetitions
  const groupByDay = (forecastList: ForecastPoint[]): ForecastPoint[] => {
    const grouped: { [key: string]: ForecastPoint } = {};
    forecastList.forEach(point => {
      const dateKey = new Date(point.datetime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = point;
      }
    });
    // Convert object to ordered array
    return Object.values(grouped).sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  };

  // no data case
  if (!forecast || forecast.length === 0) {
    return null; 
  }

  // group data by day
  const dailyForecast = groupByDay(forecast);

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
          Simple 5-Day Weather Forecast
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: Math.min(5, dailyForecast.length) }} spacing={4}>
          {dailyForecast.slice(0, 5).map((point, index) => (
            <Card 
              key={`${point.datetime}-${index}`}
              p={4}
              borderRadius="lg"
              shadow="sm"
              bg={useColorModeValue('gray.50', 'gray.700')}
              border="1px"
              borderColor={borderColor}
              transition="all 0.2s"
              _hover={{ 
                shadow: 'md',
                transform: 'translateY(-3px)'
              }}
            >
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
            </Card>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};