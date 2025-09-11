import React, { useState } from 'react';
import { 
  Box, 
  Input, 
  Button, 
  Center,
  Flex
} from '@chakra-ui/react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  initialCity?: string;
  setInputCity?: (city: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialCity = 'São Paulo', setInputCity }) => {
  const [inputValue, setInputValue] = useState(initialCity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      if (setInputCity) {
        setInputCity(inputValue);
      }
    }
  };

  return (
    <Center py={4}>
      <Box width="100%" maxWidth="600px">
        <form onSubmit={handleSubmit}>
          <Flex>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter city name..."
              size="lg"
              borderRadius="full"
              mr={2}
            />
            <Button 
              type="submit" 
              size="lg"
              borderRadius="full"
              colorScheme="blue"
              aria-label="Search city"
            >
              🔍
            </Button>
          </Flex>
        </form>
      </Box>
    </Center>
  );
};