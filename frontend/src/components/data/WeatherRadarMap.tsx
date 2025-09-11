import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Card, 
  CardBody, 
  Heading, 
  Text, 
  useColorModeValue,
  Flex,
  Icon,
  Select,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { FiMap, FiDroplet, FiWind, FiSun, FiCloud } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define interface for weather data
interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
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
  weather?: {
    description: string;
  };
  description?: string;
}

interface WeatherRadarMapProps {
  data: WeatherData; // Corrigido: definir a propriedade data com o tipo WeatherData
}

export const WeatherRadarMap: React.FC<WeatherRadarMapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const [mapLayer, setMapLayer] = useState('precipitation_new');
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  // Available layers
  const mapLayers = [
    { id: 'precipitation_new', name: 'Precipitation', icon: FiDroplet },
    { id: 'clouds_new', name: 'Clouds', icon: FiCloud },
    { id: 'wind_new', name: 'Wind', icon: FiWind },
    { id: 'temp_new', name: 'Temperature', icon: FiSun }
  ];

  // Function to add/update radar layer
  const updateRadarLayer = () => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing radar layer
    if (radarLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarLayerRef.current);
    }
    
    // Get API key from environment
    const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!OPENWEATHER_API_KEY) {
      setError('OpenWeatherMap API key not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
      return;
    }
    
    try {
      // Create new radar layer
      const newRadarLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/${mapLayer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
        {
          attribution: 'Weather data © OpenWeatherMap',
          opacity: 0.7,
          zIndex: 1000,
          tileSize: 256,
          minZoom: 1,
          maxZoom: 18
        }
      );
      
      // Add to map
      newRadarLayer.addTo(mapInstanceRef.current);
      radarLayerRef.current = newRadarLayer;
      setError(null);
    } catch (err) {
      console.error('Error adding radar layer:', err);
      setError('Failed to load weather radar data. Please check your API key and connection.');
    }
  };

  useEffect(() => {
    if (!data || !mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true
        }).setView(
          [data.latitude || -23.5505, data.longitude || -46.6333], 
          10
        );

        // Base layer from OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please check your connection.');
        return;
      }
    }

    // Update map position
    if (mapInstanceRef.current && data.latitude && data.longitude) {
      mapInstanceRef.current.setView([data.latitude, data.longitude], 10);
    }

    // Add/update radar layer
    updateRadarLayer();

    return () => {
      // Cleanup only when component is unmounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      radarLayerRef.current = null;
    };
  }, [data]); // Dependency only on data

  // Effect to update layer when map type changes
  useEffect(() => {
    if (data && mapInstanceRef.current) {
      updateRadarLayer();
    }
  }, [mapLayer, data]);

  const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMapLayer(e.target.value);
  };

  if (!data) {
    return (
      <Card 
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        boxShadow="lg"
        mb={8}
      >
        <CardBody>
          <Flex align="center" mb={4}>
            <Icon as={FiMap} color="blue.500" boxSize={5} mr={2} />
            <Heading size="md" color={textColor}>
              Weather Radar Map
            </Heading>
          </Flex>
          <Text color={subtitleColor}>Loading map data...</Text>
        </CardBody>
      </Card>
    );
  }

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
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center">
            <Icon as={FiMap} color="blue.500" boxSize={5} mr={2} />
            <Heading size="md" color={textColor}>
              Weather Radar Map
            </Heading>
            <Badge colorScheme="blue" ml={2} fontSize="xs">
              Live
            </Badge>
          </Flex>
          
          <Select 
            value={mapLayer} 
            onChange={handleLayerChange}
            size="sm"
            width="150px"
            bg={useColorModeValue('white', 'gray.700')}
            borderColor={borderColor}
          >
            {mapLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </Select>
        </Flex>
        
        {error && (
          <Alert status="warning" mb={3} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Box 
          ref={mapRef}
          h="400px"
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          overflow="hidden"
          mb={3}
        />
        
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color={subtitleColor}>
            {data.city}, {data.country}
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            Updated: {new Date().toLocaleTimeString()}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};