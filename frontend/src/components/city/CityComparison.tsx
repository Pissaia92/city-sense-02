import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner
} from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiThermometer, FiWind, FiDroplet } from 'react-icons/fi';
import { QoLData } from '../../types';

// define component expected props
interface CityComparisonProps {
  comparisonCity: string;
  setComparisonCity: React.Dispatch<React.SetStateAction<string>>;
  comparisonData: QoLData | null;
  comparisonForecast: any[] | null;
  fetchComparisonData: (cityName: string) => Promise<void>;
  fetchSuggestions: (query: string) => Promise<string[]>;
  // Statess and setters passed as props
  showComparisonSuggestions: boolean;
  setShowComparisonSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  comparisonSearchRef: React.RefObject<HTMLDivElement>;
}

export const CityComparison: React.FC<CityComparisonProps> = ({
  comparisonCity,
  setComparisonCity,
  comparisonData,
  comparisonForecast,
  fetchComparisonData,
  fetchSuggestions,
  showComparisonSuggestions,
  setShowComparisonSuggestions,
  comparisonSearchRef,
}) => {
  const [comparisonInput, setComparisonInput] = useState(comparisonCity);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const suggestionItemHoverBg = useColorModeValue('gray.100', 'gray.700');

  // Update input when comparisonCity changes
  useEffect(() => {
    setComparisonInput(comparisonCity);
  }, [comparisonCity]);

  // Handle input change with debounced suggestions
  const handleInputChange = async (value: string) => {
    setComparisonInput(value);
    setComparisonCity(value);
    setShowComparisonSuggestions(true);
    setError(null);
    
    if (value.trim()) {
      setLoadingSuggestions(true);
      try {
        // Call fetchSuggestions as prop
        const results = await fetchSuggestions(value);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load suggestions.');
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowComparisonSuggestions(false);
    }
  };

  // Handle comparison search
  const handleComparisonSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comparisonInput.trim()) {
      setIsSearching(true);
      setError(null);
      try {
        // call fetchComparisonData as prop
        await fetchComparisonData(comparisonInput);
      } catch (err) {
        setError('Failed to fetch comparison data. Please try again.');
        console.error('Error fetching comparison data:', err);
      } finally {
        setIsSearching(false);
        setShowComparisonSuggestions(false);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setComparisonInput(suggestion);
    setComparisonCity(suggestion);
    fetchComparisonData(suggestion);
    setShowComparisonSuggestions(false);
  };

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
          City Comparison
        </Heading>
        
        <Box ref={comparisonSearchRef} mb={6} position="relative">
          <form onSubmit={handleComparisonSearch}>
            <InputGroup size="lg">
              <Input
                value={comparisonInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowComparisonSuggestions(true)}
                placeholder="Enter city to compare..."
                bg={inputBg}
                border="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px #3182ce',
                }}
                borderRadius="full"
                pr="4.5rem"
              />
              <InputRightElement width="4.5rem" pr={2}>
                <Button 
                  type="submit" 
                  size="sm" 
                  borderRadius="full"
                  colorScheme="blue"
                  isLoading={isSearching}
                  aria-label="Compare cities"
                >
                  <Icon as={FiSearch} />
                </Button>
              </InputRightElement>
            </InputGroup>
          </form>
          
          {/* Suggestions Dropdown  */}
          {showComparisonSuggestions && suggestions.length > 0 && (
            <Card 
              position="absolute" 
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              boxShadow="md"
              zIndex={1000}
              w="100%"
              maxW="500px"
              mt={2}
            >
              <CardBody p={0}>
                {loadingSuggestions ? (
                  <Flex p={3} justify="center">
                    <Spinner size="sm" color="blue.500" />
                    <Text ml={2} color={subtitleColor}>Loading suggestions...</Text>
                  </Flex>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <Box
                      key={`${suggestion}-${index}`} // Chave mais robusta
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: suggestionItemHoverBg }}
                      borderBottom={index < suggestions.length - 1 ? "1px" : "none"}
                      borderColor={borderColor}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Flex align="center">
                        <Icon as={FiMapPin} color="gray.400" mr={2} />
                        <Text color={textColor}>{suggestion}</Text>
                      </Flex>
                    </Box>
                  ))
                )}
              </CardBody>
            </Card>
          )}

          {error && (
            <Alert status="error" borderRadius="lg" mt={3}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Box>
        
        {/* Results */}
        {comparisonData && (
          <Box>
            <Heading size="sm" mb={4} color={textColor} textAlign="center">
              Comparison Results
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* compared city data */}
              <Card 
                bg={useColorModeValue('blue.50', 'blue.900')}
                border="1px"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
              >
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Icon as={FiMapPin} color="blue.500" boxSize={5} mr={2} />
                    <Text fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
                      {comparisonData.city}, {comparisonData.country}
                    </Text>
                  </Flex>
                  
                  <Stat>
                    <StatLabel color={useColorModeValue('blue.700', 'blue.300')}>
                      Temperature
                    </StatLabel>
                    <StatNumber 
                      color={useColorModeValue('blue.800', 'blue.200')}
                      fontSize="2xl"
                    >
                      {comparisonData.temperature?.toFixed(1) || 'N/A'}°C
                    </StatNumber>
                    <StatHelpText color={useColorModeValue('blue.600', 'blue.400')}>
                      <Icon as={FiThermometer} mr={1} />
                      Feels like {comparisonData.temperature?.toFixed(1) || 'N/A'}°C
                    </StatHelpText>
                  </Stat>

                  <Flex mt={4} gap={4}>
                    <Stat>
                      <StatLabel color={useColorModeValue('blue.700', 'blue.300')}>
                        <Icon as={FiDroplet} mr={1} />
                        Humidity
                      </StatLabel>
                      <StatNumber 
                        color={useColorModeValue('blue.800', 'blue.200')}
                      >
                        {comparisonData.humidity || 'N/A'}%
                      </StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={useColorModeValue('blue.700', 'blue.300')}>
                        <Icon as={FiWind} mr={1} />
                        Wind
                      </StatLabel>
                      <StatNumber 
                        color={useColorModeValue('blue.800', 'blue.200')}
                      >
                        {comparisonData.wind_speed?.toFixed(1) || 'N/A'} m/s
                      </StatNumber>
                    </Stat>
                  </Flex>
                </CardBody>
              </Card>
              
              {/* compared city data */}
              <Card 
                bg={useColorModeValue('green.50', 'green.900')}
                border="1px"
                borderColor={useColorModeValue('green.200', 'green.700')}
              >
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Icon as={FiThermometer} color="green.500" boxSize={5} mr={2} />
                    <Text fontWeight="bold" color={useColorModeValue('green.800', 'green.200')}>
                      QoL Score
                    </Text>
                  </Flex>
                  
                  <Stat>
                    <StatLabel color={useColorModeValue('green.700', 'green.300')}>
                      Quality Index
                    </StatLabel>
                    <StatNumber 
                      color={useColorModeValue('green.800', 'green.200')}
                      fontSize="2xl"
                    >
                      {comparisonData.QoL_components?.overall?.toFixed(1) || 'N/A'}
                    </StatNumber>
                    <StatHelpText color={useColorModeValue('green.600', 'green.400')}>
                      Overall life quality score
                    </StatHelpText>
                  </Stat>

                  <Flex mt={4} gap={4}>
                    <Stat>
                      <StatLabel color={useColorModeValue('green.700', 'green.300')}>
                        Temp
                      </StatLabel>
                      <StatNumber 
                        color={useColorModeValue('green.800', 'green.200')}
                      >
                        {comparisonData.QoL_components?.temperature?.toFixed(1) || 'N/A'}
                      </StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={useColorModeValue('green.700', 'green.300')}>
                        Humidity
                      </StatLabel>
                      <StatNumber 
                        color={useColorModeValue('green.800', 'green.200')}
                      >
                        {comparisonData.QoL_components?.humidity?.toFixed(1) || 'N/A'}
                      </StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={useColorModeValue('green.700', 'green.300')}>
                        Wind
                      </StatLabel>
                      <StatNumber 
                        color={useColorModeValue('green.800', 'green.200')}
                      >
                        {comparisonData.QoL_components?.wind?.toFixed(1) || 'N/A'}
                      </StatNumber>
                    </Stat>
                  </Flex>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            {/* forecast if available */}
            {comparisonForecast && comparisonForecast.length > 0 && (
              <Box mt={6}>
                <Heading size="sm" mb={4} color={textColor}>
                  Forecast Comparison
                </Heading>
                <Text color={subtitleColor} fontSize="sm">
                  Forecast data for {comparisonData.city}:
                </Text>
                <Text mt={2} fontSize="sm" color={subtitleColor}>
                  (Detailed forecast comparison would be implemented here)
                </Text>
              </Box>
            )}
          </Box>
        )}
        
        {/* no data msg */}
        {!comparisonData && comparisonInput && !isSearching && (
          <Text color={subtitleColor} textAlign="center">
            Enter a city name above to compare with {comparisonInput}
          </Text>
        )}
      </CardBody>
    </Card>
  );
};