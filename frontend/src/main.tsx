// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  ChakraProvider,
  ColorModeScript,
  extendTheme,
} from '@chakra-ui/react';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import theme from './theme';

// Determine o modo inicial com base no localStorage ou preferência do sistema
const initialColorMode = (() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  // Fallback para preferência do sistema ou 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();

// Extenda o tema com o modo inicial correto
const customTheme = extendTheme({
  ...theme,
  config: {
    initialColorMode: initialColorMode, // Usa o valor calculado
    useSystemColorMode: false,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
      <ChakraProvider theme={customTheme}>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
