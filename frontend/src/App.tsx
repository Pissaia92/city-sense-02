import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { fetchIQVData } from './api/api';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { LoadingState, ErrorState } from './components/State/States';
import { CityHeader } from './components/CityHeader';
import { MetricsGrid } from './components/MetricsGrid';
import { IQVTips } from './components/IQVTips';
import { CityComparison } from './components/CityComparison';
import { IQVBreakdown } from './components/IQVBreakdown';
import ForecastChart from './components/ForecastChart';
import type { ForecastPoint } from 'components/Types/types';
import { CityMap } from './components/CityMap';
import NotificationSystem from './components/NotificationSystem';
import { WeatherAlerts } from './components/WeatherAlerts';
import { Footer } from './components/layout/Footer';
import { ThemeContext } from './context/ThemeContext';
import { DateTime } from 'luxon';

// --- Definição de Tipos ---
interface IQVData {
  city: string;
  temperature: number;
  humidity: number;
  traffic_delay: number;
  aqi: number;
  safety_index: number;
  temp_normalized: number;
  humidity_score: number;
  traffic_score: number;
  predicted_iqv: number;
  timestamp: string; // ISO string
}

// --- Definição da Interface Metric ---
interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
  icon?: string;
  color?: string;
}
// --- Componente Principal da Aplicação ---
const AppContent = () => {
  // --- Hooks e Contexto ---
  const { darkMode } = useContext(ThemeContext);

  // --- Estados ---
  const [data, setData] = useState<IQVData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputCity, setInputCity] = useState<string>('São Paulo');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [comparisonCities, setComparisonCities] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[] | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Estado para armazenar as métricas transformadas ---
  const [metricsData, setMetricsData] = useState<Metric[]>([]);

const fetchForecastData = useCallback(async (cityName: string) => {
  // Defina a URL base da sua API (ajuste a porta se necessário)
  const API_URL = 'http://localhost:8000'; // Ou use import.meta.env.VITE_API_URL
  if (!cityName) {
    setForecastData(null);
    return;
  }

  try {
    console.log(`🌤️ Fetching forecast for: ${cityName}`);
    const response = await fetch(`${API_URL}/api/forecast?city=${encodeURIComponent(cityName)}`, {
      signal: AbortSignal.timeout(8000) // Timeout de 8 segundos
    });

    if (!response.ok) {
      // Tratamento de erro
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `Error ${response.status}: ${response.statusText}`;
      console.warn('⚠️ Forecast not available:', errorMessage);
      setForecastData(null);
      return; // sair da função se houver erro
    }

    // --- PROCESSAMENTO DA RESPOSTA ---
    const result = await response.json();
    console.log('🌤️ Loaded forecast:', result.forecast);
    setForecastData(result.forecast || []); // Define como array vazio se result.forecast for null/undefined
  } catch (err: any) {
    // Tratamento de erro
    console.error('⚠️ Error fetching forecast:', err);
    // Verifica se é um erro de timeout
    if (err.name === 'AbortError') {
        console.warn('⚠️ Forecast request timed out');
    }
    setForecastData(null);
  }
}, []);

  // --- Função auxiliar para formatar delay de trânsito ---
  const formatTrafficDelay = (delayInMinutes: number): string => {
    if (delayInMinutes < 1) return "< 1 min";
    if (delayInMinutes < 60) return `${Math.round(delayInMinutes)} min`;
    const hours = Math.floor(delayInMinutes / 60);
    const minutes = Math.round(delayInMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  // --- Função para transformar dados em métricas ---
  const transformDataToMetrics = useCallback((apiData: IQVData | null): Metric[] => {
    if (!apiData) return [];

    // Exemplo de cálculo para "Climate Quality"
    const normalizedHumidityForClimate = apiData.humidity_score / 6;
    const climateQualityValue = ((apiData.temp_normalized * 0.6) + (normalizedHumidityForClimate * 0.4)) * 10;

    const formattedTrafficDelay = formatTrafficDelay(apiData.traffic_delay);

    return [
      {
        name: "General QoL",
        value: apiData.predicted_iqv,
        unit: "/100",
        description: "Índice de Qualidade de Vida geral previsto.",
      },
      {
        name: "Temperature",
        value: apiData.temperature,
        unit: "°C",
        description: "Temperatura atual.",
      },
      {
        name: "Humidity",
        value: apiData.humidity,
        unit: "%",
        description: "Umidade relativa do ar.",
      },
      {
        name: "Climate Quality",
        value: parseFloat(climateQualityValue.toFixed(2)),
        unit: "/10",
        description: "Avaliação da qualidade do clima com base em temperatura e umidade.",
      },
      {
        name: "Traffic Delay",
        value: formattedTrafficDelay,
        unit: "",
        description: "Atraso médio no trânsito.",
      },
      {
        name: "Air Quality",
        value: apiData.aqi,
        unit: "AQI",
        description: "Índice de Qualidade do Ar.",
      },
      {
        name: "Safety",
        value: apiData.safety_index,
        unit: "/10",
        description: "Índice de segurança da cidade.",
      },
    ];
  }, [formatTrafficDelay]);

  // --- useEffect para atualizar metricsData quando 'data' muda ---
  useEffect(() => {
    setMetricsData(transformDataToMetrics(data));
  }, [data, transformDataToMetrics]);

  // --- useEffect para atualizar as cidades de comparação ---
  useEffect(() => {
    if (data?.city) {
      setComparisonCities([data.city, 'Rio de Janeiro', 'Belo Horizonte']);
    }
  }, [data?.city]);

  // --- Função para buscar dados da API ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCity.trim()) {
      setError("Insert a City name.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const fetchedData: IQVData = await fetchIQVData(inputCity);
      setData(fetchedData);
      await fetchForecastData(inputCity); 
    } catch (err: any) {
      console.error("API Error:", err);
      if (err.message.includes('Failed to fetch') || err.message.includes('conection')) {
        setError('Error connecting to the server...');
      } else if (err.message.includes('404')) {
         setError(`Data for '${inputCity}' was not found.`);
      } else {
        setError(err.message || 'Failed getting data. Try again.');
      }
      setData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Função para selecionar uma sugestão ---
  const handleSelectSuggestion = (suggestion: string) => {
    setInputCity(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
       const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
       handleSearch(fakeEvent);
    }, 0);
  };

  // --- Efeito para carregar dados iniciais ---
  useEffect(() => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Efeito para fechar sugestões ao clicar fora ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Funções auxiliares para o CityHeader ---
  const dataFormatada = data
    ? DateTime.fromISO(data.timestamp).setZone('America/Sao_Paulo').toFormat("dd/MM/yyyy 'às' HH:mm")
    : '';
  const getWeatherIcon = () => {
    if (!data) return '🌤️';
    if (data.temperature > 30) return '🔥';
    if (data.temperature > 25) return '☀️';
    if (data.temperature > 15) return '⛅';
    if (data.temperature > 5) return '☁️';
    return '❄️';
  };

  // --- Renderização ---
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">

        {/* Cabeçalho */}
        <Header darkMode={darkMode} data={data} city={data?.city || inputCity} />
        
        {/* Barra de Pesquisa */}
        <div className="container mx-auto px-4 py-8">
          <SearchBar
            inputCity={inputCity}
            showSuggestions={showSuggestions}
            suggestedCities={[]} 
            setInputCity={setInputCity}
            setShowSuggestions={setShowSuggestions}
            handleSearch={handleSearch}
            handleCitySelect={handleSelectSuggestion}
            isSearching={loading}
            darkMode={darkMode}
            searchRef={searchRef}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
        
        {/* Área Principal de Conteúdo */}
        <main className="container mx-auto px-4 pb-16">

          {/* Estado de Carregamento */}
          {loading && <LoadingState darkMode={darkMode} />}
          
          {/* Estado de Erro */}
          {error && !loading && <ErrorState error={error} darkMode={darkMode} onRetry={() => {
             const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
             handleSearch(fakeEvent);
          }} />}
          
          {/* Conteúdo Principal (Dados da Cidade) */}
          {!loading && data && (
                <div className="space-y-8">
                  
                  {/* CityHeader */}
                  <CityHeader
                    darkMode={darkMode}
                    data={data}
                    dataFormatada={dataFormatada}
                    getWeatherIcon={getWeatherIcon}
                  />

                  {/* MetricsGrid */}
                  <MetricsGrid
                    darkMode={darkMode}
                    metrics={metricsData}
                  />

                  {/* IQVBreakdown */}
                  {data && (
                    <IQVBreakdown
                      darkMode={darkMode}
                      data={{
                        // Mapeando props esperadas pelo IQVBreakdown
                        city: data.city,
                        temperature: data.temperature,
                        humidity: data.humidity,
                        avg_traffic_delay_min: data.traffic_delay, // Mapeamento de nome
                        // Cálculos para métricas que o componente espera mas a API não fornece diretamente
                        iqv_climate: parseFloat((((data.temp_normalized * 0.5) + ((data.humidity_score / 6) * 0.5)) * 10).toFixed(2)),
                        iqv_humidity: parseFloat(((data.humidity_score / 6) * 10).toFixed(2)),
                        iqv_traffic: data.traffic_score,
                        iqv_trend: 5, // Placeholder
                      }}
                    />
                  )}
                  {/* ForecastChart */}
                    <ForecastChart
                      darkMode={darkMode}
                      data={forecastData}
                    />
                  {/* CityComparison - Adaptado para API Local e Funcional */}
                  <CityComparison
                    cities={comparisonCities}
                    darkMode={darkMode}
                    shouldFetch={true}
                  />

                  {/* CityMap - Adaptado e Funcional */}
                  <CityMap
                    city={data.city}
                    temperature={data.temperature}
                    iqv={data.predicted_iqv}
                  />

                  {/* NotificationSystem - Verifique props no componente */}
                  <NotificationSystem/>

                  {/* WeatherAlerts */}                  
                  <WeatherAlerts alerts={[]} 
                  />                 
                </div>
              )}
        </main>
        
        {/* Rodapé */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

const App = () => (
  <AppContent />
);

export default App;