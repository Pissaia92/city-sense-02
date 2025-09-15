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
  Icon
} from '@chakra-ui/react';

import { FaThermometer, FaTint as FaDroplet, FaWind } from 'react-icons/fa';
import { IQVData } from '../../types'; // Imports IQVData type

interface IQVBreakdownProps {
  data: IQVData;
}

export const IQVBreakdown: React.FC<IQVBreakdownProps> = ({ data }) => {
  // Colors that react to light/dark mode
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');

  // Calculates components based on 0-10 scale
  const tempComfort = Math.max(0, Math.min(10, (30 - Math.abs(data.temperature - 22)) / 3)); 
  const humidityLevel = Math.max(0, Math.min(10, (100 - data.humidity) / 5)); 
  const windConditions = Math.max(0, Math.min(10, (15 - data.wind_speed) / 1.5)); 

  // Calculates overall score (average of components)
  const overallIQV = (tempComfort + humidityLevel + windConditions) / 3;

  return (
    <Card 
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="lg"
      shadow="md"
      mb={6}
    >
      <CardBody>
        <Heading size="md" textAlign="center" mb={4} color={textColor}>
          IQV Component Analysis
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* Temperature Comfort */}
          <Card p={4} borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaThermometer} color="red.400" boxSize={5} />
              <Text fontWeight="bold" color={textColor}>
                Temperature Comfort
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="red.500" mb={1}>
              {tempComfort.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor} mb={3}>
              Based on ideal temperature range (20-25°C)
            </Text>
            <Box w="100%" h="8px" borderRadius="full" bg={useColorModeValue('gray.200', 'gray.600')} overflow="hidden">
              <Box 
                h="100%" 
                w={`${tempComfort * 10}%`} 
                borderRadius="full"
                bg="red.500"
              />
            </Box>
          </Card>

          {/* Humidity Level */}
          <Card p={4} borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaDroplet} color="blue.400" boxSize={5} />
              <Text fontWeight="bold" color={textColor}>
                Humidity Level
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500" mb={1}>
              {humidityLevel.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor} mb={3}>
              Optimal humidity between 40-60%
            </Text>
            <Box w="100%" h="8px" borderRadius="full" bg={useColorModeValue('gray.200', 'gray.600')} overflow="hidden">
              <Box 
                h="100%" 
                w={`${humidityLevel * 10}%`} 
                borderRadius="full"
                bg="blue.500"
              />
            </Box>
          </Card>

          {/* Wind Conditions */}
          <Card p={4} borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaWind} color="purple.400" boxSize={5} />
              <Text fontWeight="bold" color={textColor}>
                Wind Conditions
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="purple.500" mb={1}>
              {windConditions.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor} mb={3}>
              Lower wind speeds are more comfortable
            </Text>
            <Box w="100%" h="8px" borderRadius="full" bg={useColorModeValue('gray.200', 'gray.600')} overflow="hidden">
              <Box 
                h="100%" 
                w={`${windConditions * 10}%`} 
                borderRadius="full"
                bg="purple.500"
              />
            </Box>
          </Card>
        </SimpleGrid>

        {/* Overall IQV Score */}
        <Card 
          mt={6} 
          p={4} 
          borderRadius="lg" 
          bg={useColorModeValue('blue.50', 'blue.900')}
        >
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
              Overall IQV Score
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
              {overallIQV.toFixed(1)}
            </Text>
          </Flex>
        </Card>
      </CardBody>
    </Card>
  );
};