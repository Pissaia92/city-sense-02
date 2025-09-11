import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Button,
  Icon,
  Heading
} from '@chakra-ui/react';
import { FiGlobe, FiSearch } from 'react-icons/fi';

interface InitialStateProps {
  onFetchData: (city: string) => void;
}

export const InitialState: React.FC<InitialStateProps> = ({ onFetchData }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.700');

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="100vh" 
      bg={bgColor}
      p={8}
    >
      <Box 
        bg={cardBg}
        p={10}
        borderRadius="2xl"
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        textAlign="center"
        maxWidth="600px"
        boxShadow="xl"
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
      >
        <Icon 
          as={FiGlobe} 
          color={useColorModeValue('blue.500', 'blue.300')} 
          boxSize={16} 
          mb={6}
        />
        
        <Heading size="lg" color={textColor} mb={4}>
          Welcome to City Sense
        </Heading>
        
        <Text fontSize="lg" color={subtitleColor} mb={8}>
          Discover the Quality of Life Index for cities around the world. 
          Enter a city name to get started.
        </Text>
        
        <Button 
          onClick={() => onFetchData('São Paulo')}
          bg={buttonBg}
          color="white"
          _hover={{ bg: buttonHoverBg, transform: 'translateY(-2px)' }}
          size="lg"
          borderRadius="full"
          leftIcon={<Icon as={FiSearch} />}
          boxShadow="md"
          _active={{ transform: 'translateY(0)' }}
        >
          Load São Paulo Data
        </Button>
        
        <Text fontSize="sm" color={subtitleColor} mt={6}>
          Try searching for: New York, London, Tokyo, Paris...
        </Text>
      </Box>
    </Flex>
  );
};