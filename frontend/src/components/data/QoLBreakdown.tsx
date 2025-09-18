import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Icon,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { FaThermometer, FaTint, FaWind, FaSun, FaSmog, FaChartLine, FaCloudRain, FaInfoCircle } from 'react-icons/fa';
import { QoLData } from '../../types';

interface QoLBreakdownProps {
  data: QoLData;
}

export const QoLBreakdown: React.FC<QoLBreakdownProps> = ({ data }) => {
  // light/dark mode colors reactions
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleBgColor = useColorModeValue('gray.50', 'gray.700');

  // AQI aux functions 
  const getAqiLabel = (aqi?: number) => {
    if (aqi === undefined || aqi === null) return 'N/A';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAqiDescription = (aqi?: number) => {
    if (aqi === undefined || aqi === null) return '';
    if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects.';
    if (aqi <= 200) return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.';
    if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
    return 'Health warning of emergency conditions: everyone is likely to be affected.';
  };

  const getAqiColor = (aqi?: number) => {
    if (aqi === undefined || aqi === null) return 'gray.500';
    if (aqi <= 50) return 'green.500';
    if (aqi <= 100) return 'yellow.500';
    if (aqi <= 150) return 'orange.500';
    if (aqi <= 200) return 'red.500';
    if (aqi <= 300) return 'purple.500';
    return 'pink.500';
  };

  // UV Index aux functions
  const getUvLabel = (uv?: number) => {
    if (uv === undefined || uv === null) return 'N/A';
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  const getUvDescription = (uv?: number) => {
    if (uv === undefined || uv === null) return '';
    if (uv <= 2) return 'No protection needed. You can safely stay outside.';
    if (uv <= 5) return 'Protection needed. Seek shade during midday hours, cover up, and wear sunscreen.';
    if (uv <= 7) return 'Protection needed. Seek shade near midday, cover up, and wear sunscreen.';
    if (uv <= 10) return 'Extra protection needed. Avoid being outside during midday hours. Cover up, wear sunscreen, and wear a hat.';
    return 'Extra protection needed. Avoid being outside during midday hours. Cover all skin, wear sunscreen, and wear a hat.';
  };

  const getUvColor = (uv?: number) => {
    if (uv === undefined || uv === null) return 'gray.500';
    if (uv <= 2) return 'green.500';
    if (uv <= 5) return 'yellow.500';
    if (uv <= 7) return 'orange.500';
    if (uv <= 10) return 'red.500';
    return 'purple.500';
  };

  const getPrecipitationColor = (precipIndex?: number) => {
  if (precipIndex === undefined || precipIndex === null) return 'gray.500';
  if (precipIndex <= 2) return 'green.500';
  if (precipIndex <= 5) return 'yellow.500';
  if (precipIndex <= 8) return 'orange.500';
  return 'red.500';
};

// const getPrecipitationLabel = (precipIndex?: number) => {
//   if (precipIndex === undefined || precipIndex === null) return 'N/A';
//   if (precipIndex <= 2) return 'Low';
//   if (precipIndex <= 5) return 'Moderate';
//   if (precipIndex <= 8) return 'High';
//   return 'Very High';
// };

  // Components math
  const tempComfort = Math.max(0, Math.min(10, (30 - Math.abs(data.temperature - 22)) / 3));
  const humidityLevel = Math.max(0, Math.min(10, (100 - data.humidity) / 5));
  const windConditions = Math.max(0, Math.min(10, (15 - data.wind_speed) / 1.5));
  const overallQoL = (tempComfort + humidityLevel + windConditions) / 3;

  return (
    <Card 
      bg={bgColor}
      borderRadius="lg"
      shadow="md"
      mb={6}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <CardBody>
        <Heading size="md" textAlign="center" mb={4} color={textColor}>
          QoL Components & Environmental Factors
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>

          {/* Temperature Comfort */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaThermometer} color="red.500" boxSize={5} />
              <Text fontWeight="bold" color="red.500">
                Temperature Comfort
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {tempComfort.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Based on ideal range (20-25°C)
            </Text>
            <Flex mt={2}>
              <Box 
                w="100%" 
                h="8px" 
                borderRadius="full"
                bgColor={useColorModeValue('gray.200', 'gray.600')}
                overflow="hidden"
              >
                <Box 
                  h="100%" 
                  w={`${tempComfort * 10}%`} 
                  borderRadius="full"
                  bgColor="red.500"
                />
              </Box>
            </Flex>
          </Card>

          {/* Humidity Level */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>              
              <Icon as={FaTint} color="blue.500" boxSize={5} />
              <Text fontWeight="bold" color="blue.500">
                Humidity Level
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {humidityLevel.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Optimal between 40-60%
            </Text>
            <Flex mt={2}>
              <Box 
                w="100%" 
                h="8px" 
                borderRadius="full"
                bgColor={useColorModeValue('gray.200', 'gray.600')}
                overflow="hidden"
              >
                <Box 
                  h="100%" 
                  w={`${humidityLevel * 10}%`} 
                  borderRadius="full"
                  bgColor="blue.500"
                />
              </Box>
            </Flex>
          </Card>

          {/* Wind Conditions */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaWind} color="purple.500" boxSize={5} />
              <Text fontWeight="bold" color="purple.500">
                Wind Conditions
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {windConditions.toFixed(1)}
            </Text>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Lower wind speeds are more comfortable
            </Text>
            <Flex mt={2}>
              <Box 
                w="100%" 
                h="8px" 
                borderRadius="full"
                bgColor={useColorModeValue('gray.200', 'gray.600')}
                overflow="hidden"
              >
                <Box 
                  h="100%" 
                  w={`${windConditions * 10}%`} 
                  borderRadius="full"
                  bgColor="purple.500"
                />
              </Box>
            </Flex>
          </Card>

          {/* Air Quality Index (AQI) */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaSmog} color={getAqiColor(data.aqi?.us_epa_index)} boxSize={5} />
              <Text fontWeight="bold" color={getAqiColor(data.aqi?.us_epa_index)}>
                Air Quality (AQI)
              </Text>
              <Tooltip 
                label={getAqiDescription(data.aqi?.us_epa_index)} 
                placement="top" 
                hasArrow
                bg={useColorModeValue('gray.700', 'gray.200')}
                color={useColorModeValue('white', 'gray.800')}
              >
                <span>
                  <Icon as={FaInfoCircle} boxSize={3} color={useColorModeValue('gray.500', 'gray.400')} cursor="help" />
                </span>
              </Tooltip>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {data.aqi?.us_epa_index !== undefined ? data.aqi.us_epa_index : 'N/A'}
            </Text>
            <Text fontSize="sm" color={getAqiColor(data.aqi?.us_epa_index)}>
              {getAqiLabel(data.aqi?.us_epa_index)}
            </Text>
            {/* Legends*/}
            <Text fontSize="xs" mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
              0-50: Good | 51-100: Moderate | 101-150: Unhealthy (SG) | 151-200: Unhealthy | 201-300: Very Unhealthy | 301+: Hazardous
            </Text>
          </Card>

          {/* UV Index */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaSun} color={getUvColor(data.uv_index)} boxSize={5} />
              <Text fontWeight="bold" color={getUvColor(data.uv_index)}>
                UV Index
              </Text>
              <Tooltip 
                label={getUvDescription(data.uv_index)} 
                placement="top" 
                hasArrow
                bg={useColorModeValue('gray.700', 'gray.200')}
                color={useColorModeValue('white', 'gray.800')}
              >
                <span>
                  <Icon as={FaInfoCircle} boxSize={3} color={useColorModeValue('gray.500', 'gray.400')} cursor="help" />
                </span>
              </Tooltip>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {data.uv_index !== undefined ? data.uv_index.toFixed(1) : 'N/A'}
            </Text>
            <Text fontSize="sm" color={getUvColor(data.uv_index)}>
              {getUvLabel(data.uv_index)}
            </Text>
            {/* Legends */}
            <Text fontSize="xs" mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
              0-2: Low | 3-5: Moderate | 6-7: High | 8-10: Very High | 11+: Extreme
            </Text>
          </Card>

          {/* Precipitation Index */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={subtleBgColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaCloudRain} color={getPrecipitationColor(data.precipitation_index?.value)} boxSize={5} />
              <Text fontWeight="bold" color={getPrecipitationColor(data.precipitation_index?.value)}>
                Precipitation Index
              </Text>
              <Tooltip 
                label="Based on probability and amount of rain expected in the next few hours." 
                placement="top" 
                hasArrow
                bg={useColorModeValue('gray.700', 'gray.200')}
                color={useColorModeValue('white', 'gray.800')}
              >
                <span>
                  <Icon as={FaInfoCircle} boxSize={3} color={useColorModeValue('gray.500', 'gray.400')} cursor="help" />
                </span>
              </Tooltip>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={1}>
              {data.precipitation_index?.value !== undefined ? data.precipitation_index.value.toFixed(1) : 'N/A'}
            </Text>
            {/* Uses the textual summary directly from the backend data */}
            <Text fontSize="sm" color={getPrecipitationColor(data.precipitation_index?.value)}>
              {data.precipitation_index?.summary || 'N/A'}
            </Text>
            <Text fontSize="xs" mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
              0-2: Low | 3-5: Moderate | 6-8: High | 9-10: Very High
            </Text>
          </Card>

          {/* Overall QoL Score */}
          <Card 
            p={4} 
            borderRadius="lg" 
            bg={useColorModeValue('teal.50', 'teal.900')}
            borderWidth="1px"
            borderColor={useColorModeValue('teal.200', 'teal.700')}
            gridColumn={{ base: "span 1", sm: "span 2", lg: "span 3" }}
          >
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Icon as={FaChartLine} color={useColorModeValue('teal.600', 'teal.300')} boxSize={5} />
                <Text fontWeight="bold" color={useColorModeValue('teal.800', 'teal.200')}>
                  Overall QoL Score
                </Text>
              </Flex>
              <Text fontSize="3xl" fontWeight="bold" color={useColorModeValue('teal.700', 'teal.300')}>
                {overallQoL.toFixed(1)}
              </Text>
            </Flex>
          </Card>

        </SimpleGrid>
      </CardBody>
    </Card>
  );
};
