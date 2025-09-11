import React, { useState } from 'react';
import { 
  Box, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Button, 
  Center,
  Flex,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { SearchSuggestions } from './SearchSuggestions';

interface SearchBarProps {
  onSearch: (city: string) => void;
  initialCity?: string;
  setInputCity?: (city: string) => void;
  fetchSuggestions?: (query: string) => Promise<string[]>;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  initialCity = 'São Paulo', 
  setInputCity,
  fetchSuggestions 
}) => {
  const [inputValue, setInputValue] = useState(initialCity);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.700');

  // Handle input change with debounced suggestions
  const handleInputChange = async (value: string) => {
    setInputValue(value);
    setShowSuggestions(true);
    
    if (fetchSuggestions && value.trim()) {
      setLoadingSuggestions(true);
      try {
        // Debounce the API call
        const timeoutId = setTimeout(async () => {
          try {
            const results = await fetchSuggestions(value);
            setSuggestions(results);
          } catch (err) {
            console.error('Error fetching suggestions:', err);
            setSuggestions([]);
          } finally {
            setLoadingSuggestions(false);
          }
        }, 300);
        
        return () => clearTimeout(timeoutId);
      } catch (err) {
        console.error('Error setting up debounce:', err);
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      if (setInputCity) {
        setInputCity(inputValue);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    if (setInputCity) {
      setInputCity(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <Center py={4} position="relative">
      <Box width="100%" maxWidth="600px">
        <form onSubmit={handleSubmit}>
          <Flex direction="column">
            <InputGroup size="lg">
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter city name..."
                size="lg"
                borderRadius="full"
                mr={2}
                bg={bgColor}
                border="2px"
                borderColor={borderColor}
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px #3182ce',
                }}
                _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500'),
                }}
              />
              <InputRightElement width="4.5rem" pr={2}>
                <Button 
                  type="submit" 
                  size="sm" 
                  borderRadius="full"
                  bg={buttonBg}
                  color="white"
                  _hover={{ 
                    bg: buttonHoverBg,
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  aria-label="Search city"
                  leftIcon={<Icon as={FiSearch} />}
                  boxShadow="md"
                  transition="all 0.2s"
                >
                  Search
                </Button>
              </InputRightElement>
            </InputGroup>
            
            {showSuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                loading={loadingSuggestions}
              />
            )}
          </Flex>
        </form>
      </Box>
    </Center>
  );
};