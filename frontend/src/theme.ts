import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light', // Valor padrão, será sobrescrito
  useSystemColorMode: false,
};

// Custom theme for City Sense
const theme = extendTheme({
config,
  colors: {
    brand: {
50: '#e6f7ff',
100: '#b3e0ff',
200: '#80c9ff',
300: '#4db2ff',
400: '#1a9bff',
500: '#007acc', 
600: '#005a99',
700: '#003d66',
800: '#001f33',
900: '#000d1a',
},
// Colors for different conditions climate
weather: {
clear: '#ffeb3b', // Light yellow for clear skies
cloudy: '#90a4ae', // Bluish gray for cloudy
rain: '#2196f3', // Blue for rain
storm: '#311b92', // Purple for storms
snow: '#bbdefb', // Light blue for snow
wind: '#81c784', // Green for wind
},
// Colors for the Quality of Life Index (QLI)
QoL: {
excellent: '#4caf50', // Green for excellent
good: '#8bc34a', // Light green for good
fair: '#ffeb3b', // Yellow for fair
poor: '#ff9800', // Orange for poor
bad: '#f44336', // Red for very poor
}
},
fonts: {
heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`, 
body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`, 
}, 
components: { 
Button: { 
baseStyle: { 
fontWeight: '500', 
borderRadius: 'full', 
transition: 'all 0.2s', 
_focus: { 
boxShadow: 'outline', 
}, 
}, 
variants: { 
solid: { 
bg: 'brand.500', 
color: 'white', 
_hover: { 
bg: 'brand.600', 
transform: 'translateY(-2px)', 
boxShadow: 'lg', 
}, 
_active: { 
bg: 'brand.700', 
}, 
}, 
outline: { 
borderColor: 'brand.500', 
color: 'brand.500', 
_hover: { 
bg: 'brand.500', 
color: 'white', 
transform: 'translateY(-2px)', 
boxShadow: 'lg', 
}, 
}, 
}, 
}, 
input: { 
baseStyle: { 
field: { 
borderRadius: 'full', 
fontWeight: '400', 
}, 
}, 
variants: { 
filled: { 
field: { 
bg: 'gray.100', 
_dark: { 
bg: 'gray.700', 
}, 
_hover: { 
bg: 'gray.200', 
_dark: { 
bg: 'gray.600', 
}, 
}, 
_focus: { 
bg: 'white', 
_dark: { 
bg: 'gray.800', 
}, 
borderColor: 'brand.500', 
boxShadow: '0 0 0 1px #007acc', 
}, 
}, 
}, 
}, 
}, 
Card: { 
baseStyle: { 
container: { 
borderRadius: 'xl', 
boxShadow: 'sm', 
transition: 'all 0.3s', 
_hover: { 
boxShadow: 'md', 
transform: 'translateY(-2px)', 
}, 
}, 
}, 
}, 
}, 
styles: { 
global: { 
body: { 
bg: 'gray.50', 
_dark: { 
bg: 'gray.900', 
}, 
}, 
}, 
},
});

export default theme;