import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading data...' }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="100vh" 
      bg={bgColor}
      p={8}
    >
      <Spinner 
        thickness='4px' 
        speed='0.65s' 
        emptyColor='gray.200' 
        color={spinnerColor} 
        size='xl' 
        mb={4}
      />
      <Text fontSize="lg" color={textColor} textAlign="center">
        {message}
      </Text>
    </Flex>
  );
};