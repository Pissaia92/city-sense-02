// import React from 'react';
// import { 
//   Box, 
//   Flex, 
//   Text, 
//   useColorModeValue,
//   Card,
//   CardBody,
//   Heading,
//   Badge,
//   Icon
// } from '@chakra-ui/react';
// import { FiMapPin, FiNavigation } from 'react-icons/fi';

// interface QoLData {
//   city: string;
//   country: string;
//   temperature: number;
//   humidity: number;
//   wind_speed: number;
//   QoL_components: {
//     temperature: number;
//     humidity: number;
//     wind: number;
//     overall: number;
//   };
//   timestamp: string;
//   latitude: number;
//   longitude: number;
//   weather?: {
//     description: string;
//   };
//   description?: string;
// }

// interface CityMapProps {
//   data: QoLData; // Adicionando a prop data
// }

// export const CityMap: React.FC<CityMapProps> = ({ data }) => {
//   const bgColor = useColorModeValue('white', 'gray.800');
//   const borderColor = useColorModeValue('gray.200', 'gray.700');
//   const textColor = useColorModeValue('gray.800', 'white');
//   const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  
//   if (!data) {
//     return (
//       <Card 
//         bg={bgColor}
//         border="1px"
//         borderColor={borderColor}
//         boxShadow="lg"
//         mb={8}
//       >
//         <CardBody>
//           <Heading size="md" mb={4} color={textColor}>City Location</Heading>
//           <Text color={subtitleColor}>Loading map data...</Text>
//         </CardBody>
//       </Card>
//     );
//   }

//   return (
//     <Card 
//       bg={bgColor}
//       border="1px"
//       borderColor={borderColor}
//       boxShadow="lg"
//       mb={8}
//       transition="all 0.3s"
//       _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
//     >
//       <CardBody>
//         <Heading size="md" mb={6} color={textColor} textAlign="center">
//           City Location
//         </Heading>
        
//         <Box 
//           h="400px" 
//           bg={useColorModeValue('gray.100', 'gray.700')}
//           borderRadius="lg"
//           border="1px"
//           borderColor={borderColor}
//           mb={4}
//           position="relative"
//           overflow="hidden"
//         >
//           {/* Map Placeholder */}
//           <Flex 
//             direction="column" 
//             align="center" 
//             justify="center" 
//             h="100%"
//             bg={useColorModeValue('blue.50', 'blue.900')}
//           >
//             <Icon as={FiMapPin} color="red.500" boxSize={16} mb={4} />
//             <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
//               {data.city}, {data.country}
//             </Text>
//             <Text color={subtitleColor} mb={4}>
//               Interactive map coming soon
//             </Text>
            
//             <Box 
//               bg={useColorModeValue('white', 'gray.800')}
//               p={4}
//               borderRadius="lg"
//               border="1px"
//               borderColor={borderColor}
//               boxShadow="md"
//             >
//               <Flex align="center" mb={2}>
//                 <Icon as={FiNavigation} color="blue.500" mr={2} />
//                 <Text fontWeight="bold" color={textColor}>
//                   Coordinates
//                 </Text>
//               </Flex>
//               <Text color={subtitleColor} fontSize="sm">
//                 Latitude: {data.latitude?.toFixed(6) || '0.000000'}
//               </Text>
//               <Text color={subtitleColor} fontSize="sm">
//                 Longitude: {data.longitude?.toFixed(6) || '0.000000'}
//               </Text>
//             </Box>
//           </Flex>
//         </Box>
        
//         <Flex justify="center" wrap="wrap" gap={2}>
//           <Badge colorScheme="blue">Geolocation</Badge>
//           <Badge colorScheme="green">Real-time</Badge>
//           <Badge colorScheme="purple">Interactive</Badge>
//         </Flex>
//       </CardBody>
//     </Card>
//   );
// };