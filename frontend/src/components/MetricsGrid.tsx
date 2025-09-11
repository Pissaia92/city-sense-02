import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Progress,
  Badge
} from '@chakra-ui/react';

interface MetricsGridProps {
   any;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  
  // Função para obter cor do IQV
  const getIqvColor = (value: number) => {
    if (value >= 80) return 'green.400';
    if (value >= 60) return 'yellow.400';
    if (value >= 40) return 'orange.400';
    return 'red.400';
  };

  // Função para obter cor da temperatura
  const getTempColor = (temp: number) => {
    if (temp > 30) return 'red.400';
    if (temp > 25) return 'orange.400';
    if (temp > 15) return 'green.400';
    if (temp > 5) return 'blue.400';
    return 'blue.600';
  };

  if (!data) {
    return (
      <Flex wrap="wrap" gap={6} justify="center">
        {[1, 2, 3, 4].map((item) => (
          <Card 
            key={item} 
            w="220px" 
            h="180px"
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          >
            <CardBody>
              <Text fontSize="sm" color={subtitleColor} mb={2}>Loading...</Text>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>--</Text>
            </CardBody>
          </Card>
        ))}
      </Flex>
    );
  }

  const metrics = [
    {
      title: "Temperature",
      value: `${data.temperature?.toFixed(1) || 'N/A'}°C`,
      color: getTempColor(data.temperature || 0),
      icon: "🌡️",
      progress: Math.min(100, Math.max(0, ((data.temperature || 0) + 10) * 3.33))
    },
    {
      title: "Humidity",
      value: `${data.humidity?.toFixed(1) || 'N/A'}%`,
      color: "blue.400",
      icon: "💧",
      progress: data.humidity || 0
    },
    {
      title: "Wind Speed",
      value: `${data.wind_speed?.toFixed(1) || 'N/A'} m/s`,
      color: "gray.400",
      icon: "💨",
      progress: Math.min(100, (data.wind_speed || 0) * 10)
    },
    {
      title: "IQV Score",
      value: data.iqv_components?.overall?.toFixed(1) || 'N/A',
      color: getIqvColor(data.iqv_components?.overall || 0),
      icon: "🎯",
      progress: data.iqv_components?.overall || 0
    }
  ];

  return (
    <Flex wrap="wrap" gap={6} justify="center" mb={8}>
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          w="220px" 
          h="180px"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          boxShadow="md"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
        >
          <CardBody display="flex" flexDirection="column" justifyContent="space-between">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color={subtitleColor}>{metric.title}</Text>
              <Text fontSize="xl">{metric.icon}</Text>
            </Flex>
            
            <Box>
              <Heading 
                size="lg" 
                color={metric.color}
                transition="all 0.3s"
              >
                {metric.value}
              </Heading>
              
              <Progress 
                value={metric.progress} 
                size="sm" 
                colorScheme={metric.color.split('.')[0]} 
                mt={3}
                borderRadius="full"
              />
            </Box>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
};