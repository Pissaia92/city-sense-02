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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon
} from '@chakra-ui/react';
import { FiThermometer, FiDroplet, FiWind } from 'react-icons/fi';

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

interface IQVBreakdownProps {
  data: IQVData; // Adicionando a prop data
}

export const IQVBreakdown: React.FC<IQVBreakdownProps> = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  
  // Função para obter cor do componente IQV
  const getComponentColor = (value: number) => {
    if (value >= 80) return 'green.400';
    if (value >= 60) return 'yellow.400';
    if (value >= 40) return 'orange.400';
    return 'red.400';
  };

  if (!data?.iqv_components) {
    return (
      <Card 
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        boxShadow="lg"
        mb={8}
      >
        <CardBody>
          <Heading size="md" mb={4} color={textColor}>IQV Breakdown</Heading>
          <Text color={subtitleColor}>Loading components...</Text>
        </CardBody>
      </Card>
    );
  }

  const components = [
    {
      title: "Temperature Comfort",
      value: data.iqv_components.temperature?.toFixed(1) || '0.0',
      color: getComponentColor(data.iqv_components.temperature || 0),
      icon: FiThermometer,
      description: "Based on ideal temperature range (20-25°C)"
    },
    {
      title: "Humidity Level",
      value: data.iqv_components.humidity?.toFixed(1) || '0.0',
      color: getComponentColor(data.iqv_components.humidity || 0),
      icon: FiDroplet,
      description: "Optimal humidity between 40-60%"
    },
    {
      title: "Wind Conditions",
      value: data.iqv_components.wind?.toFixed(1) || '0.0',
      color: getComponentColor(data.iqv_components.wind || 0),
      icon: FiWind,
      description: "Lower wind speeds are more comfortable"
    }
  ];

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
          IQV Component Analysis
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {components.map((component, index) => (
            <Card 
              key={index} 
              bg={useColorModeValue('gray.50', 'gray.700')}
              border="1px"
              borderColor={borderColor}
              transition="all 0.2s"
              _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
            >
              <CardBody>
                <Flex align="center" mb={3}>
                  <Icon as={component.icon} color={component.color} boxSize={5} mr={2} />
                  <Text fontWeight="bold" color={textColor}>{component.title}</Text>
                </Flex>
                
                <Stat>
                  <StatNumber 
                    color={component.color} 
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    {component.value}
                  </StatNumber>
                  <StatHelpText color={subtitleColor} fontSize="sm">
                    {component.description}
                  </StatHelpText>
                </Stat>
                
                <Progress 
                  value={parseFloat(component.value)} 
                  size="sm" 
                  colorScheme={component.color.split('.')[0]} 
                  borderRadius="full"
                  mt={2}
                />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        
        <Box 
          mt={6} 
          p={4} 
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="lg"
          border="1px"
          borderColor={useColorModeValue('blue.200', 'blue.700')}
        >
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
              Overall IQV Score
            </Text>
            <Heading 
              size="lg" 
              color={getComponentColor(data.iqv_components.overall || 0)}
            >
              {data.iqv_components.overall?.toFixed(1) || '0.0'}
            </Heading>
          </Flex>
        </Box>
      </CardBody>
    </Card>
  );
};