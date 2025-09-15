import React, { useState } from 'react';
import {
  Box,
  Flex,
  Select,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Icon,
  Badge,
  Text
} from '@chakra-ui/react';
import { FiMap } from 'react-icons/fi';
import { IQVData } from '../../types';

interface WeatherRadarMapProps {
  data: IQVData;
}

export const WeatherRadarMap: React.FC<WeatherRadarMapProps> = ({ data }) => {
  const [overlay, setOverlay] = useState<string>('temp');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  // Base URL Windy
  const baseUrl = 'https://embed.windy.com/embed2.html';

  // Parameters
  const params = `?lat=${data.latitude}&lon=${data.longitude}&detailLat=${data.latitude}&detailLon=${data.longitude}&zoom=5&level=surface&overlay=${overlay}&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;

  // Opções de camadas para o dropdown
  const overlayOptions = [
    { value: 'wind', label: 'Vento' },
    { value: 'temp', label: 'Temperatura' },
    { value: 'rain', label: 'Chuva' },
    { value: 'clouds', label: 'Nuvens' },
    { value: 'pressure', label: 'Pressão' }
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
          
          {/* Dropdown inactive */}
          {/* <Select
            width="auto"
            minWidth="150px"
            value={overlay}
            onChange={(e) => setOverlay(e.target.value)}
            size="sm"
            bg={useColorModeValue('white', 'gray.700')}
            color={textColor}
            borderColor={borderColor}
          >
            {overlayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select> */}
        </Flex>

        {/* Iframe Windy */}
        <Box
          borderRadius="lg"
          overflow="hidden"
          height={{ base: '50vh', md: '60vh' }} // Altura responsiva
          width="100%"
          bg={useColorModeValue('gray.100', 'gray.900')} // Fundo enquanto carrega
          border="1px"
          borderColor={borderColor}
        >
          <iframe
            src={baseUrl + params}
            width="100%"
            height="100%"
            frameBorder="0"
            title={`Windy Map - ${data.city}`}
            loading="lazy" // Carregamento lazy para melhor performance
          ></iframe>
        </Box>
        
        <Flex justify="space-between" align="center" mt={3}>
          <Text fontSize="sm" color={subtitleColor}>
            {data.city}, {data.country}
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            {/* Mostra a hora da última atualização dos dados da cidade, não do mapa em si */}
            Updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};