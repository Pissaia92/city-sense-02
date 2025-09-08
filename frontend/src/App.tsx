import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { fetchIQVData } from './api/api';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { LoadingState, ErrorState } from './components/State/States';
import { CityHeader } from './components/CityHeader';
import { MetricsGrid } from './components/MetricsGrid';
import { IQVTips } from './components/IQVTips';
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
  const searchRef = useRef<HTMLDivElement>(null);

  // --- NOVO: Estado para armazenar as métricas transformadas ---
  const [metricsData, setMetricsData] = useState<Metric[]>([]);

  // --- Função auxiliar para formatar delay de trânsito ---
  const formatTrafficDelay = (delayInMinutes: number): string => {
    if (delayInMinutes < 1) return "< 1 min";
    if (delayInMinutes < 60) return `${Math.round(delayInMinutes)} min`;
    const hours = Math.floor(delayInMinutes / 60);
    const minutes = Math.round(delayInMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  // --- NOVO: Função para transformar dados em métricas ---
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
      setError("Por favor, insira o nome de uma cidade.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const fetchedData: IQVData = await fetchIQVData(inputCity);
      setData(fetchedData);
    } catch (err: any) {
      console.error("Erro ao buscar dados da API:", err);
      if (err.message.includes('Failed to fetch') || err.message.includes('conexão')) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else if (err.message.includes('404')) {
         setError(`Dados para a cidade '${inputCity}' não foram encontrados.`);
      } else {
        setError(err.message || 'Falha ao obter dados. Tente novamente.');
      }
      setData(null);
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
              
              {/* MetricsGrid - Corrigido: Fechado imediatamente */}
              <MetricsGrid
                darkMode={darkMode}
                metrics={metricsData}
              />
              
              {/* IQVTips - Corrigido: Renderizado como irmão, fora do MetricsGrid */}
              <IQVTips
                darkMode={darkMode}
                data={{
                  city: data.city,
                  iqv_climate: ((data.temp_normalized * 0.5) + ((data.humidity_score / 6) * 0.5)) * 10,
                  iqv_humidity: (data.humidity_score / 6) * 10,
                  iqv_traffic: data.traffic_score,
                  iqv_trend: 5, // Valor placeholder
                  iqv_overall: data.predicted_iqv,
                }}
              />

            </div>
          )}
          
          {/* Estado Inicial */}
          {!loading && !data && !error && (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-4">Nenhuma cidade selecionada</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Digite o nome de uma cidade no campo acima para ver seu Índice de Qualidade de Vida Urbana.
              </p>
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