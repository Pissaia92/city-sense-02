import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue,
  Button,
  Icon
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const textColor = useColorModeValue('red.800', 'red.200');
  const buttonBg = useColorModeValue('red.500', 'red.600');
  const buttonHoverBg = useColorModeValue('red.600', 'red.700');

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="100vh" 
      bg={useColorModeValue('gray.50', 'gray.900')}
      p={8}
    >
      <Box 
        bg={bgColor}
        p={8}
        borderRadius="xl"
        border="1px"
        borderColor={useColorModeValue('red.200', 'red.700')}
        textAlign="center"
        maxWidth="500px"
        boxShadow="lg"
      >
        <Icon 
          as={FiAlertTriangle} 
          color={useColorModeValue('red.500', 'red.300')} 
          boxSize={12} 
          mb={4}
        />
        <Text fontSize="lg" color={textColor} mb={6}>
          {message}
        </Text>
        {onRetry && (
          <Button 
            onClick={onRetry}
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            size="lg"
            borderRadius="full"
          >
            Try Again
          </Button>
        )}
      </Box>
    </Flex>
  );
};