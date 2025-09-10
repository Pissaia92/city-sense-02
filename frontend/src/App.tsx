import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppContent } from './components/AppContent';
import './App.css';

function App() {
  const [API_URL, setAPI_URL] = useState('');

  useEffect(() => {
    // Detectar ambiente de desenvolvimento ou produção
    const isDevelopment = import.meta.env.DEV;
    const apiUrl = import.meta.env.VITE_API_URL || 
                  (isDevelopment ? 'http://localhost:8000' : 'https://seu-backend-url-aqui');
    
    setAPI_URL(apiUrl);
    console.log('Using API URL:', apiUrl);
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <AppContent API_URL={API_URL} />  
      </div>
    </ThemeProvider>
  );
}

export default App;