import React from 'react';
import {
  Box,
  Flex,
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Icon,
  Badge
} from '@chakra-ui/react';
import { FiMap } from 'react-icons/fi';
import { QoLData } from '../../types'

interface WeatherRadarMapProps {
  data: QoLData;
}

export const WeatherRadarMap: React.FC<WeatherRadarMapProps> = ({ data }) => {
       const bgColor = useColorModeValue('white', 'gray.800');
       const borderColor = useColorModeValue('gray.200', 'gray.700');
       const textColor = useColorModeValue('gray.800', 'white');
       const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  // Base URL Windy
  const baseUrl = 'https://embed.windy.com/embed2.html';

  // Parameters
  const params = `?lat=${data.latitude}&lon=${data.longitude}&detailLat=${data.latitude}&detailLon=
  ${data.longitude}&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=
  now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <Card
      bg={bgColor}
      borderRadius="lg"
      shadow="md"
      p={4}
      mb={6}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <CardBody>
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <Flex align="center">
            <Icon as={FiMap} color="blue.500" boxSize={5} mr={2} />
            <Heading size="md" color={textColor}>
              Interactive Weather Map
            </Heading>
            <Badge colorScheme="blue" ml={2} fontSize="xs">
              Windy
            </Badge>
          </Flex>
        </Flex>

        {/* Iframe Windy */}
        <Box
          borderRadius="lg"
          overflow="hidden"
          height={{ base: '50vh', md: '60vh' }}
          width="100%"
          bg={useColorModeValue('gray.100', 'gray.900')} // loading bg
          border="1px"
          borderColor={borderColor}
        >
          <iframe
            src={baseUrl + params}
            width="100%"
            height="100%"
            frameBorder="0"
            title={`Windy Map - ${data.city}`}
            loading="lazy" // Lazy loading for better performance
          ></iframe>
        </Box>
        
        <Flex justify="space-between" align="center" mt={3}>
          <Text fontSize="xs" color={subtitleColor}>
            {data.city}, {data.country}
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            {/* Show last hour updated data for city */}
            Updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};