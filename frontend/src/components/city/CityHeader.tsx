// frontend/src/components/city/CityHeader.tsx
import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { IQVData } from '../../types'; // Importa o tipo IQVData

interface CityHeaderProps {
  data: IQVData;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Cores que reagem ao modo claro/escuro
  const bgColor = useColorModeValue('gray.100', 'gray.700'); // Fundo mais sutil
  const textColor = useColorModeValue('gray.800', 'white'); // Texto principal
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300'); // Texto secundário
  const borderColor = useColorModeValue('gray.300', 'gray.600'); // Borda

  // Processa a descrição do clima
  const weatherDescription = data.weather?.description || '';
  let conditionText = 'Unknown';
  
  if (weatherDescription) {
    // Capitaliza a primeira letra
    conditionText = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    
    // Mapeia descrições específicas para textos mais amigáveis (opcional)
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
      // Adicione mais casos conforme necessário
    }
  }

  return (
    <Box 
      bg={bgColor} 
      borderRadius="lg" 
      p={{ base: 3, sm: 4 }} // Padding responsivo
      shadow="md"
      mb={6}
      maxW="xl"
      mx="auto"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex justify="center" align="center" direction="column">
        {/* Weather Icon and Temperature */}
        <Flex align="center" gap={2} mb={2}>
          <Icon as={FaMapMarkerAlt} color={textColor} boxSize={5} />
          {/* ✅ Corrigido: Nome da cidade dinâmico */}
          <Text fontSize="sm" color={secondaryTextColor}>
            {data.city}, {data.country}
          </Text>
        </Flex>
        
        <Flex align="center" gap={3} mb={1}>
          {/* ✅ Corrigido: Temperatura principal */}
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor}>
            {data.temperature}°C
          </Text>
          {/* ✅ Corrigido: Condição do tempo sem "Unknown" quando há dados */}
          {weatherDescription && (
            <Text fontSize="sm" color={secondaryTextColor}>
              {conditionText}
            </Text>
          )}
        </Flex>

        {/* Location and Timestamp */}
        <Flex 
          justify="center" 
          align="center" 
          gap={{ base: 3, sm: 4 }} 
          mt={2} 
          fontSize="xs" 
          color={secondaryTextColor}
          flexWrap="wrap" // Permite quebra de linha em telas pequenas
        >
          <Flex align="center" gap={1}>
            <Icon as={FaMapMarkerAlt} boxSize={3} />
            <Text>
              {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </Text>
          </Flex>
          <Flex align="center" gap={1}>
            <Icon as={FaClock} boxSize={3} />
            <Text>Updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};