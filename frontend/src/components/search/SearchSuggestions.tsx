import React from 'react';
import { 
  Box, 
  Text, 
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  loading?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ 
  suggestions, 
  onSelect, 
  loading = false 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  if (loading) {
    return (
      <Card 
        position="absolute" 
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="md"
        zIndex={1000}
        w="100%"
        maxW="600px"
        mt={2}
      >
        <CardBody p={3} textAlign="center">
          <Text color={subtitleColor}>Loading suggestions...</Text>
        </CardBody>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card 
      position="absolute" 
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="md"
      zIndex={1000}
      w="100%"
      maxW="600px"
      mt={2}
    >
      <CardBody p={0}>
        {suggestions.map((suggestion, index) => (
          <Box
            key={index}
            p={3}
            cursor="pointer"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
            borderBottom={index < suggestions.length - 1 ? "1px" : "none"}
            borderColor={borderColor}
            onClick={() => onSelect(suggestion)}
          >
            <Flex align="center">
              <Icon as={FiMapPin} color="gray.400" mr={2} />
              <Text color={textColor}>{suggestion}</Text>
            </Flex>
          </Box>
        ))}
      </CardBody>
    </Card>
  );
};