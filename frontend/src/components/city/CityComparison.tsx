import React, { useState } from 'react';
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
  Divider,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiThermometer, FiDroplet, FiWind } from 'react-icons/fi';

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

interface CityComparisonProps {
  comparisonCity: string;
  setComparisonCity: (city: string) => void;
  comparisonData: IQVData | null;
  comparisonForecast: any;
  fetchComparisonData: (city: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  showComparisonSuggestions: boolean;
  setShowComparisonSuggestions: (show: boolean) => void;
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
  comparisonSearchRef
}) => {
  const [comparisonInput, setComparisonInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');

  // Handle input change with debounced suggestions
  const handleInputChange = async (value: string) => {
    setComparisonInput(value);
    setShowComparisonSuggestions(true);
    setError(null);
    
    if (value.trim()) {
      setLoadingSuggestions(true);
      try {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle comparison search
  const handleComparisonSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comparisonInput.trim()) {
      setIsSearching(true);
      setError(null);
      try {
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
        
        <Box ref={comparisonSearchRef} mb={6}>
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
          
          {error && (
            <Alert status="error" borderRadius="lg" mt={3}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Box>
        
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
                <Box p={3} textAlign="center">
                  <Text color={subtitleColor}>Loading suggestions...</Text>
                </Box>
              ) : (
                suggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
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
        
        {comparisonData && (
          <Box>
            <Heading size="sm" mb={4} color={textColor} textAlign="center">
              Comparison Results
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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
                </CardBody>
              </Card>
              
              <Card 
                bg={useColorModeValue('green.50', 'green.900')}
                border="1px"
                borderColor={useColorModeValue('green.200', 'green.700')}
              >
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Icon as={FiThermometer} color="green.500" boxSize={5} mr={2} />
                    <Text fontWeight="bold" color={useColorModeValue('green.800', 'green.200')}>
                      IQV Score
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
                      {comparisonData.iqv_components?.overall?.toFixed(1) || 'N/A'}
                    </StatNumber>
                    <StatHelpText color={useColorModeValue('green.600', 'green.400')}>
                      Overall life quality score
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            {comparisonForecast && (
              <Box mt={6}>
                <Heading size="sm" mb={4} color={textColor}>
                  Forecast Comparison
                </Heading>
                <Text color={subtitleColor} fontSize="sm">
                  Forecast data for {comparisonData.city} would be displayed here
                </Text>
              </Box>
            )}
          </Box>
        )}
        
        {!comparisonData && comparisonInput && !isSearching && (
          <Text color={subtitleColor} textAlign="center">
            Enter a city name above to compare with {comparisonInput}
          </Text>
        )}
      </CardBody>
    </Card>
  );
};