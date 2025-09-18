import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

const AppWithProviders = () => {
  return (
    <ThemeProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  );
};

const RootWrapper = () => (
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RootWrapper />);
} else {
  console.error("Failed to find the root element");
}