import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaUsers, FaChartLine } from 'react-icons/fa';
import { IQVData } from '../../types';

interface CityHeaderProps {
  data: IQVData;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Cores que reagem ao modo claro/escuro
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.600', 'blue.300');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  console.log("CityHeader received data:", data);

  // Processa a descrição do clima
  const weatherDescription = data.weather?.description || '';
  let conditionText = 'Unknown';

  if (weatherDescription) {
    conditionText = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    switch (weatherDescription.toLowerCase()) {
      case 'broken clouds': conditionText = 'Partly Cloudy'; break;
      case 'few clouds': conditionText = 'Mostly Sunny'; break;
      case 'clear sky': conditionText = 'Clear Sky'; break;
      case 'scattered clouds': conditionText = 'Scattered Clouds'; break;
      case 'shower rain': conditionText = 'Shower Rain'; break;
      case 'rain': conditionText = 'Rain'; break;
      case 'thunderstorm': conditionText = 'Thunderstorm'; break;
      case 'snow': conditionText = 'Snow'; break;
      case 'mist': conditionText = 'Mist'; break;
      // Adicione mais conforme necessário
    }
  }

  // Formata a população
  const formatPopulation = (pop?: number) => {
    if (pop === undefined || pop === null) return 'N/A';
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`;
    } else if (pop >= 1000) {
      return `${(pop / 1000).toFixed(1)}k`;
    }
    return pop.toString();
  };

  // Formata o HDI
  const formatHDI = (hdi?: number, year?: number) => {
    if (hdi === undefined || hdi === null) return 'N/A';
    let classification = '';
    if (hdi >= 0.8) classification = '(Very High)';
    else if (hdi >= 0.7) classification = '(High)';
    else if (hdi >= 0.55) classification = '(Medium)';
    else classification = '(Low)';

    const yearStr = year ? ` (${year})` : '';
    return `${hdi.toFixed(3)} ${classification}${yearStr}`;
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={{ base: 3, sm: 4 }}
      shadow="md"
      mb={6}
      maxW="2xl" // Um pouco mais largo para acomodar os dados
      mx="auto"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex direction="column" align="center">
        {/* Linha 1: Localização */}
        <Flex align="center" gap={2} mb={2}>
          <Icon as={FaMapMarkerAlt} color={textColor} boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            {data.city}{data.state ? `, ${data.state}` : ''}, {data.country}
          </Text>
        </Flex>

        {/* Linha 2: Temperatura e Condição */}
        <Flex align="center" gap={3} mb={2}>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor}>
            {data.temperature.toFixed(1)}°C
          </Text>
          {weatherDescription && (
            <Text fontSize="sm" color={secondaryTextColor}>
              {conditionText}
            </Text>
          )}
        </Flex>

         {/* Linha 3: População e HDI */}
        <Flex justify="center" align="center" wrap="wrap" gap={4} mb={2} fontSize="sm">
          {/* Verifica se population existe (não é undefined nem null) */}
          {data.population !== undefined && data.population !== null && (
            <Flex align="center" gap={1}>
              <Icon as={FaUsers} color={highlightColor} boxSize={3} />
              <Text color={secondaryTextColor}>{formatPopulation(data.population)}</Text>
            </Flex>
          )}
          {/* Verifica se hdi existe (não é undefined nem null) */}
          {data.hdi !== undefined && data.hdi !== null && (
            <Flex align="center" gap={1}>
              <Icon as={FaChartLine} color={highlightColor} boxSize={3} />
              <Text color={secondaryTextColor}>{formatHDI(data.hdi, data.hdi_year)}</Text>
            </Flex>
          )}
        </Flex>

        {/* Linha 4: Coordenadas e Hora */}
        <Flex
          justify="center"
          align="center"
          gap={{ base: 3, sm: 4 }}
          fontSize="xs"
          color={secondaryTextColor}
          flexWrap="wrap"
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