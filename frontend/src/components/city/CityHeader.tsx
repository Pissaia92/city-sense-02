// frontend/src/components/city/CityHeader.tsx
import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaUsers, FaClock, FaSun, FaCloud, FaCloudRain } from 'react-icons/fa';
import { IQVData } from '../../types'; // Importa o tipo IQVData

interface CityHeaderProps {
  data: IQVData; // Define a propriedade data com o tipo correto
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Cores que reagem ao modo claro/escuro
  // const bgColor = useColorModeValue('gray.100', 'gray.700'); // Removido pois não é usado
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.600', 'blue.300');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

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
      return `${(pop / 1000000).toFixed(1)}M habitantes`;
    }
    if (pop >= 1000) {
      return `${(pop / 1000).toFixed(1)}k habitantes`;
    }
    return pop.toString();
  };

  // Formata a hora local
  const formatLocalTime = () => {
    if (!data.timestamp) return 'N/A';
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formata a data/hora da última atualização
  const formatLastUpdate = () => {
    if (!data.timestamp) return 'N/A';
    const date = new Date(data.timestamp);
    // Corrigido: 'ano' -> 'year'
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função auxiliar para obter ícone do clima
  const getWeatherIcon = (description: string) => {
    if (!description) return FaSun;
    const desc = description.toLowerCase(); // Corrigido: 'descricao' -> 'description'
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return FaCloudRain;
    }
    if (desc.includes('cloud') || desc.includes('nublado')) {
      return FaCloud;
    }
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) { // Corrigido: 'descricao' -> 'description'
      return FaSun;
    }
    return FaSun; // Ícone padrão
  };

  return (
    <Box
      bg={useColorModeValue('gray.100', 'gray.700')}
      borderRadius="lg"
      p={{ base: 3, sm: 4 }}
      shadow="md"
      mb={6}
      maxW="2xl"
      mx="auto"
      borderWidth="1px"
      borderColor={borderColor}
    >
      {/* Linha 1: Nome da cidade + País */}
      <Flex align="center" gap={2} mb={2}>
        <Icon as={FaMapMarkerAlt} color={textColor} boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          {data.city}, {data.country}
        </Text>
      </Flex>

      {/* Linha 2: Ícone de clima + descrição */}
      <Flex align="center" gap={2} mb={2}>
        <Icon
          as={getWeatherIcon(weatherDescription)}
          color={highlightColor}
          boxSize={6}
        />
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          {conditionText}
        </Text>
      </Flex>

      {/* Linha 3: Sensação térmica, UV, AQI, População e Hora local */}
      {/* Nota: As propriedades feelslike_c, uv e air_quality não estão presentes no tipo IQVData
          conforme definido no unused dep.txt. Elas precisam ser adicionadas ao backend e ao tipo
          para serem exibidas aqui. Por enquanto, vamos comentar essas partes. */}
      <Flex justify="center" align="center" wrap="wrap" gap={4} mb={2} fontSize="xs">
        {/* Sensação térmica - Comentado pois não está no tipo IQVData */}
        {/* {data.feelslike_c !== undefined && data.feelslike_c !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaSun} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>Feels like: {data.feelslike_c.toFixed(1)}°C</Text>
          </Flex>
        )} */}

        {/* Índice UV - Comentado pois não está no tipo IQVData */}
        {/* {data.uv !== undefined && data.uv !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaSun} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>UV: {data.uv}</Text>
          </Flex>
        )} */}

        {/* Qualidade do ar (AQI) - Comentado pois não está no tipo IQVData */}
        {/* {data.air_quality && (
          <Flex align="center" gap={1}>
            <Icon as={FaCloud} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>AQI: {data.air_quality["us-epa-index"]}</Text>
          </Flex>
        )} */}

        {/* População */}
        {data.population !== undefined && data.population !== null && (
          <Flex align="center" gap={1}>
            <Icon as={FaUsers} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatPopulation(data.population)}</Text>
          </Flex>
        )}

        {/* Hora local */}
        {data.timestamp && (
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>{formatLocalTime()}</Text>
          </Flex>
        )}

        {/* Data/hora da última atualização */}
        {data.timestamp && (
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color={highlightColor} boxSize={3} />
            <Text color={secondaryTextColor}>Updated: {formatLastUpdate()}</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};