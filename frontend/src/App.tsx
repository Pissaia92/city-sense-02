// frontend/src/App.tsx
import React, { useState, useEffect, useContext } from 'react';
import type { ForecastPoint } from './components/Types/types';
import { ForecastChart } from './components/ForecastChart';
import { DateTime } from 'luxon';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { LoadingState, ErrorState } from './components/State/States';
import { CityHeader } from './components/CityHeader';
import { MetricsGrid } from './components/MetricsGrid';
import { IQVBreakdown } from './components/IQVBreakdown';
import { IQVTips } from './components/IQVTips';
import { Footer } from './components/layout/Footer';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import MapVisualization from './components/MapVisualization';

interface IQVData {
  city: string;
  country: string;
  updated_at: string;
  temperature: number;
  description: string;
  humidity: number;
  avg_traffic_delay_min: number;
  iqv_climate: number;
  iqv_traffic: number;
  iqv_humidity: number;
  iqv_trend: number;
  iqv_overall: number;
}

const AppContent = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [data, setData] = useState<IQVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState('São Paulo');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [forecast, setForecast] = useState<ForecastPoint[] | null>(null);
  const [searchTried, setSearchTried] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Formata a data de atualização
  const dataFormatada = data
    ? DateTime.fromISO(data.updated_at)
        .setZone('America/Sao_Paulo')
        .toFormat("dd/MM/yyyy 'às' HH:mm")
    : '';

  // Função para buscar dados do IQV com timeout
  const fetchData = async (cityName: string) => {
    const formattedCity = cityName.trim().replace(/\s+/g, ' ');
    if (!formattedCity) {
      setError('Por favor, insira uma cidade válida');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSearchTried(true);
      console.log(`🔍 Buscando dados para: ${formattedCity}`);
      const response = await fetch(`/api/iqv?city=${encodeURIComponent(formattedCity)}`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `Erro ${response.status}: ${response.statusText}`;
        if (response.status === 404 && errorMessage.toLowerCase().includes('não encontrada')) {
          setError(`❌ Cidade "${formattedCity}" não encontrada. Verifique o nome e tente novamente.`);
        } else {
          setError(`⚠️ ${errorMessage}`);
        }
        setData(null);
        return;
      }
      const result = await response.json();
      console.log('✅ Dados recebidos:', result);
      setData(result);
      setCity(formattedCity);
    } catch (err: any) {
      console.error('🚨 Erro na busca:', err);
      if (err.name === 'AbortError') {
        setError('⏳ Tempo limite excedido. Tente novamente.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('🔌 Erro de conexão. Verifique se o backend está rodando em http://localhost:8000');
      } else {
        setError(`⚠️ ${err.message || 'Erro inesperado ao carregar os dados'}`);
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Busca previsão do tempo com tratamento robusto
  const fetchForecast = async () => {
    if (!city) return;
    try {
      console.log(`🌤️ Buscando previsão para: ${city}`);
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`, {
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `Erro ${response.status}: ${response.statusText}`;
        console.warn('⚠️ Previsão não disponível:', errorMessage);
        setForecast(null);
        return;
      }
      const result = await response.json();
      console.log('🌤️ Previsão carregada:', result.forecast);
      setForecast(result.forecast);
    } catch (err) {
      console.error('⚠️ Erro na previsão:', err);
      setForecast(null);
    }
  };

  // Inicializa com São Paulo
  useEffect(() => {
    // Só busca se não tivermos tentado antes
    if (!searchTried) {
      fetchData('São Paulo');
    }
    const interval = setInterval(() => {
      if (city) fetchData(city);
    }, 60000);
    return () => clearInterval(interval);
  }, [city, searchTried]);

  // Carrega previsão quando a cidade muda
  useEffect(() => {
    if (city) {
      fetchForecast();
      const interval = setInterval(fetchForecast, 300000);
      return () => clearInterval(interval);
    }
  }, [city]);

  // Manipula a busca
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCity.trim()) {
      setError('Por favor, insira uma cidade');
      return;
    }
    setLoading(true);
    setError(null);
    await fetchData(inputCity);
  };

  // Seleciona cidade da lista de sugestões
  const handleCitySelect = (selectedCity: string) => {
    setInputCity(selectedCity);
    fetchData(selectedCity);
    setShowSuggestions(false);
  };

  // Formata o atraso de trânsito
  const formatTrafficDelay = (delay: number) => {
    if (delay <= 0) return '0 minutos';
    return `${Math.round(delay)} minutos`;
  };

  // Cidades sugeridas
  const suggestedCities = [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Salvador",
    "Brasília", "Fortaleza", "Manaus", "Curitiba", "Recife", "Goiânia", "Florianópolis",
    "London", "Paris", "Berlin", "Madrid", "Rome",
    "Tokyo", "Seoul", "Beijing", "New York", "Los Angeles"
  ];

  // Dados para o mapa
  const cityData = data ? {
    longitude: -46.633309, // São Paulo (substitua por dados reais)
    latitude: -23.55052,
    iqv: data.iqv_overall,
    city: data.city,
    country: data.country
  } : null;

  return (
    <>
      {/* Container externo: ocupa 100% da largura (background nas laterais) */}
      <div style={{ 
        width: '100%',
        backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        {/* Container interno: conteúdo centralizado com largura máxima */}
        <div style={{
          fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '20px',
          color: darkMode ? '#e2e8f0' : '#1e293b'
        }}>
          <Header 
            data={data} 
            city={city || 'Carregando...'} 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <SearchBar
            inputCity={inputCity}
            showSuggestions={showSuggestions}
            suggestedCities={suggestedCities}
            setInputCity={setInputCity}
            setShowSuggestions={setShowSuggestions}
            handleSearch={handleSearch}
            handleCitySelect={handleCitySelect}
            isSearching={loading}
            darkMode={darkMode}
          />
          
          {/* Estado de carregamento inicial */}
          {!searchTried && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '50vh',
              backgroundColor: darkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '16px',
                animation: 'pulse 2s infinite'
              }}>
                🌍
              </div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: darkMode ? '#cbd5e1' : '#475569',
                marginBottom: '8px'
              }}>
                Carregando cidade inicial
              </h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Buscando dados para São Paulo...
              </p>
              <style>
                {`@keyframes pulse { 
                  0% { opacity: 0.6; } 
                  50% { opacity: 1; } 
                  100% { opacity: 0.6; } 
                }`}
              </style>
            </div>
          )}
          
          {/* Estado de loading durante busca */}
          {loading && searchTried && !data && <LoadingState darkMode={darkMode} />}
          
          {/* Erros */}
          {error && (
            <ErrorState 
              error={error} 
              onRetry={() => city ? fetchData(city) : fetchData(inputCity)} 
              darkMode={darkMode}
            />
          )}
          
          {/* Dados principais */}
          {data && !loading && !error && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 350px',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div>
                <CityHeader 
                  data={data} 
                  dataFormatada={dataFormatada} 
                  getWeatherIcon={() => {
                    const desc = data.description.toLowerCase();
                    if (desc.includes('chuva') || desc.includes('storm')) return '⛈️';
                    if (desc.includes('nublado') || desc.includes('cloud')) return '☁️';
                    if (desc.includes('sol') || desc.includes('clear')) return '☀️';
                    if (desc.includes('neve')) return '❄️';
                    return '🌤️';
                  }} 
                  darkMode={darkMode}
                />
                <MetricsGrid data={data} formatTrafficDelay={formatTrafficDelay} darkMode={darkMode} />
              </div>
              <div>
                <IQVBreakdown data={data} darkMode={darkMode} />
                <IQVTips data={data} darkMode={darkMode} />
              </div>
            </div>
          )}
          
          {/* Mapa da cidade */}
          {data && !loading && !error && (
            <div style={{ 
              marginBottom: '32px',
              backgroundColor: darkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  color: darkMode ? '#cbd5e1' : '#1e293b'
                }}>
                  Mapa da Cidade
                </h2>
                <div>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    style={{
                      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                  </button>
                </div>
              </div>
              {showMap && (
                <div style={{ padding: '16px' }}>
                  <MapVisualization 
                    cityData={cityData} 
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Previsão do tempo */}
          {forecast && (
            <div style={{ 
              marginBottom: '32px',
              backgroundColor: darkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
              }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  color: darkMode ? '#cbd5e1' : '#1e293b'
                }}>
                  Previsão e temperatura média para os próximos 7 dias
                </h2>
              </div>
              <div style={{ padding: '16px' }}>
                <ForecastChart data={forecast} darkMode={darkMode} />
              </div>
            </div>
          )}
          
          {/* Mensagem quando não há dados */}
          {!data && searchTried && !loading && !error && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: darkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
              marginTop: '24px'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: darkMode ? '#cbd5e1' : '#1e293b',
                marginBottom: '16px'
              }}>
                Nenhuma cidade selecionada
              </h2>
              <p style={{ 
                color: darkMode ? '#94a3b8' : '#64748b',
                fontSize: '1.1rem',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Digite o nome de uma cidade no campo acima para ver sua qualidade de vida urbana
              </p>
            </div>
          )}
          
          <Footer darkMode={darkMode} />
        </div>
      </div>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;