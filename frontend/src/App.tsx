import React, { useState, useEffect, useContext, useRef } from 'react';
import type { ForecastPoint } from './components/Types/types';
import ForecastChart from './components/ForecastChart'; 
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
import { CityComparison } from './components/CityComparison';

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
  latitude: number; 
  longitude: number; 
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
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [showComparisonSuggestions, setShowComparisonSuggestions] = useState(false);
  const [mainSuggestions, setMainSuggestions] = useState<string[]>([]);
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const comparisonSearchRef = useRef<HTMLDivElement>(null);
  const [comparisonSuggestions, setComparisonSuggestions] = useState<string[]>([]);
  const [mlPrediction, setMLPrediction] = useState<{
    predicted_iqv: number;
    current_temperature: number;
    current_humidity: number;
    current_traffic_delay: number;
    timestamp: string;
  } | null>(null);
  
  // Estado para cidade de comparação
  const [comparisonCity, setComparisonCity] = useState('');
  const [comparisonForecast, setComparisonForecast] = useState<ForecastPoint[] | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const getIQVColor = (iqv: number, darkMode: boolean) => 
    iqv >= 8 ? (darkMode ? '#10b981' : '#047857') :
    iqv >= 6 ? (darkMode ? '#84cc16' : '#65a30d') :
    iqv >= 4 ? (darkMode ? '#eab308' : '#ca8a04') :
    iqv >= 2 ? (darkMode ? '#f97316' : '#c2410c') :
    (darkMode ? '#ef4444' : '#b91c1c');

  const dataFormatada = data ? DateTime.fromISO(data.updated_at).setZone('America/Sao_Paulo').toFormat("dd/MM/yyyy 'às' HH:mm") : '';

const fetchSuggestions = async (query: string, isComparison: boolean = false) => {
    if (!query.trim()) {
      if (isComparison) {
        setComparisonSuggestions([]);
      } else {
        setMainSuggestions([]);
      }
      return;
    }
    try {
      const response = await fetch(`/api/iqv?city=${encodeURIComponent(query)}`);
      if (response.ok) {
        const suggestions = await response.json();
        if (isComparison) {
          setComparisonSuggestions(suggestions);
        } else {
          setMainSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      if (isComparison) {
        setComparisonSuggestions([]);
      } else {
        setMainSuggestions([]);
      }
    }
  };
  const handleComparisonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setComparisonCity(value);
    setShowComparisonSuggestions(value.length > 0);
    if (value.length > 2) {
      fetchSuggestions(value, true);
    } else {
      setComparisonSuggestions([]);
    }
  };

  const selectMainSuggestion = (suggestion: string) => {
    setInputCity(suggestion);
    setShowMainSuggestions(false);
    fetchData(suggestion);
  };

  const selectComparisonSuggestion = (suggestion: string) => {
    setComparisonCity(suggestion);
    setShowComparisonSuggestions(false);
  };

  const fetchData = async (cityName: string) => {
    const formattedCity = cityName.trim().replace(/\s+/g, ' '); 
    if (!formattedCity) { setError('Por favor, insira uma cidade válida'); setLoading(false); return; }
    try { setLoading(true); setError(null); setSearchTried(true); 
      console.log(`🔍 Buscando dados para: ${formattedCity}`); 
      const response = await fetch(`/api/iqv?city=${encodeURIComponent(formattedCity)}`, { 
        signal: AbortSignal.timeout(10000) 
      }); 
      if (!response.ok) { 
        const errorData = await response.json().catch(() => null); 
        const errorMessage = errorData?.detail || `Erro ${response.status}: ${response.statusText}`; 
        if (response.status === 404 && errorMessage.toLowerCase().includes('não encontrada')) { 
          setError(`❌ Cidade "${formattedCity}" não encontrada. Verifique o nome e tente novamente.`); 
        } else { setError(`⚠️ ${errorMessage}`); } 
        setData(null); return; 
      } 
      const result = await response.json(); 
      console.log('✅ Dados recebidos:', result); 
      setData(result); setCity(formattedCity); 
    } catch (err: any) { 
      console.error('🚨 Erro na busca:', err); 
      if (err.name === 'AbortError') { setError('⏳ Tempo limite excedido. Tente novamente.'); } 
      else if (err.message.includes('Failed to fetch')) { setError('🔌 Erro de conexão. Verifique se o backend está rodando em http://localhost:8000'); } 
      else { setError(`⚠️ ${err.message || 'Erro inesperado ao carregar os dados'}`); } 
      setData(null); 
    } finally { setLoading(false); }
  };

  const fetchForecast = async (cityName?: string) => {
    const cityToFetch = cityName || city; if (!cityToFetch) return;
    try { 
      console.log(`🌤️ Buscando previsão para: ${cityToFetch}`); 
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(cityToFetch)}`, { 
        signal: AbortSignal.timeout(8000) 
      }); 
      if (!response.ok) { 
        const errorData = await response.json().catch(() => null); 
        const errorMessage = errorData?.detail || `Erro ${response.status}: ${response.statusText}`; 
        console.warn('⚠️ Previsão não disponível:', errorMessage); 
        if (cityName === comparisonCity) setComparisonForecast(null); else setForecast(null); return; 
      } 
      const result = await response.json(); 
      console.log('🌤️ Previsão carregada:', result.forecast); 
      if (cityName === comparisonCity) setComparisonForecast(result.forecast); else setForecast(result.forecast); 
    } catch (err) { 
      console.error('⚠️ Erro na previsão:', err); 
      if (cityName === comparisonCity) setComparisonForecast(null); else setForecast(null); 
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainSearchRef.current && !mainSearchRef.current.contains(event.target as Node)) {
        setShowMainSuggestions(false);
      }
      if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target as Node)) {
        setShowComparisonSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => { if (!searchTried) fetchData('São Paulo'); 
    const interval = setInterval(() => { if (city) fetchData(city); }, 60000); 
    return () => clearInterval(interval); 
  }, [city, searchTried]);

  useEffect(() => { if (city) { fetchForecast(); 
    const interval = setInterval(() => { fetchForecast(); if (comparisonCity) fetchForecast(comparisonCity); }, 300000); 
    return () => clearInterval(interval); 
  } }, [city, comparisonCity]);

  const handleSearch = async (e: React.FormEvent) => { e.preventDefault(); 
    if (!inputCity.trim()) { setError('Por favor, insira uma cidade'); return; } 
    setLoading(true); setError(null); await fetchData(inputCity); 
  };

  const handleCitySelect = (selectedCity: string) => { setInputCity(selectedCity); fetchData(selectedCity); setShowSuggestions(false); };

  const handleCompareCities = () => { 
    if (comparisonCity.trim() && data) { 
      setComparisonLoading(true);
      // Apenas busca a previsão da cidade de comparação
      fetchForecast(comparisonCity); 
      console.log(`Comparando ${data.city} com ${comparisonCity}`); 
      // Timeout para garantir que o loading desapareça
      setTimeout(() => setComparisonLoading(false), 3000);
    } 
  };

  const formatTrafficDelay = (delay: number) => delay <= 0 ? '0 minutos' : `${Math.round(delay)} minutos`;

  const suggestedCities = [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Salvador",
    "Brasília", "Fortaleza", "Manaus", "Curitiba", "Recife", "Goiânia", "Florianópolis",
    "London", "Paris", "Berlin", "Madrid", "Rome",
    "Tokyo", "Seoul", "Beijing", "New York", "Los Angeles"
  ];

  const cityData = data ? { 
    longitude: data.longitude, 
    latitude: data.latitude, 
    iqv: data.iqv_overall, 
    city: data.city, 
    country: data.country 
  } : null;

  useEffect(() => { if (city && data) { const fetchMLPrediction = async () => { try { const response = await fetch(`/api/predict/iqv?city=${encodeURIComponent(city)}`); if (response.ok) { const prediction = await response.json(); setMLPrediction(prediction); } } catch (err) { console.error('Erro ao buscar previsão do ML:', err); } }; fetchMLPrediction(); 
    const interval = setInterval(fetchMLPrediction, 1800000); return () => clearInterval(interval); 
  } }, [city, data]);

  return (
    <>
      <div style={{ 
        width: '100%',
        backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        <div style={{
          fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '20px',
          color: darkMode ? '#e2e8f0' : '#1e293b'
        }}>
          <Header data={data} city={city || 'Carregando...'} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <SearchBar
            inputCity={inputCity}
            showSuggestions={showMainSuggestions}
            suggestedCities={mainSuggestions}
            setInputCity={setInputCity}
            setShowSuggestions={setShowMainSuggestions}
            handleSearch={handleSearch}
            handleCitySelect={handleCitySelect}
            isSearching={loading}
            darkMode={darkMode}
            searchRef={mainSearchRef}
            onInputChange={handleComparisonInputChange}
            onSelectSuggestion={selectMainSuggestion}
          />
          
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
              <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'pulse 2s infinite' }}>🌍</div>
              <h2 style={{ fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#475569', marginBottom: '8px' }}>Carregando cidade inicial</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Buscando dados para São Paulo...</p>
              <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
            </div>
          )}
          
          {loading && searchTried && !data && <LoadingState darkMode={darkMode} />}
          {error && (<ErrorState error={error} onRetry={() => city ? fetchData(city) : fetchData(inputCity)} darkMode={darkMode} />)}
          
          {data && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginBottom: '32px' }}>
              <div>
                <CityHeader data={data} dataFormatada={dataFormatada} getWeatherIcon={() => { const desc = data.description.toLowerCase(); if (desc.includes('chuva') || desc.includes('storm')) return '⛈️'; if (desc.includes('nublado') || desc.includes('cloud')) return '☁️'; if (desc.includes('sol') || desc.includes('clear')) return '☀️'; if (desc.includes('neve')) return '❄️'; return '🌤️'; }} darkMode={darkMode} />
                <MetricsGrid data={data} formatTrafficDelay={formatTrafficDelay} darkMode={darkMode} />
              </div>
              <div>
                <IQVBreakdown data={data} darkMode={darkMode} />
                <IQVTips data={data} darkMode={darkMode} />
              </div>
            </div>
          )}
          
          {/*Previsão do IQV com ML */}
          {data && !loading && !error && (
            <div style={{ marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }}>Previsão de IQV com M.L.</h2>
              </div>
              <div style={{ padding: '16px' }}>
                {mlPrediction ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <h3 style={{ color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '10px' }}>IQV Atual</h3>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getIQVColor(data.iqv_overall, darkMode) }}>{data.iqv_overall.toFixed(1)}</div>
                    </div>
                    <div>
                      <h3 style={{ color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '10px' }}>IQV Previsto</h3>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getIQVColor(mlPrediction.predicted_iqv, darkMode) }}>{mlPrediction.predicted_iqv.toFixed(1)}</div>
                      <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: '5px' }}>
                        {mlPrediction.predicted_iqv > data.iqv_overall ? "📈 Tendência positiva" : mlPrediction.predicted_iqv < data.iqv_overall ? "📉 Tendência negativa" : "➡️ Estabilidade"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px', color: darkMode ? '#94a3b8' : '#64748b' }}>🤖</div>
                    <p style={{ color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center' }}>Processando previsão do IQV com machine learning...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Seção de comparação de cidades - APENAS O CAMPO DE BUSCA */}
          {data && (
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
                  Comparação de Cidades
                </h2>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: '600',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}>
                      Digite a cidade para comparação:
                    </span>
                    <div ref={comparisonSearchRef} style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        value={comparisonCity}
                        onChange={handleComparisonInputChange}
                        onBlur={() => setTimeout(() => setShowComparisonSuggestions(false), 200)}
                        onFocus={() => setShowComparisonSuggestions(true)}
                        placeholder="Ex: Rio de Janeiro"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                          color: darkMode ? '#e2e8f0' : '#1e293b',
                          width: '100%'
                        }}
                      />
                      {showComparisonSuggestions && comparisonSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: darkMode ? '#1e293b' : 'white',
                          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          marginTop: '4px'
                        }}>
                          {comparisonSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectComparisonSuggestion(suggestion)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                color: darkMode ? '#e2e8f0' : '#1e293b'
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCompareCities}
                      disabled={comparisonLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: comparisonLoading ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {comparisonLoading ? 'Carregando...' : 'Comparar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Gráfico de comparação apenas quando houver cidade para comparar */}
          {data && comparisonCity.trim() !== '' && (
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
                  Comparação de Cidades
                </h2>
              </div>
              <div style={{ padding: '16px' }}>
                {comparisonLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      marginBottom: '10px',
                      color: darkMode ? '#94a3b8' : '#64748b'
                    }}>
                      🔄
                    </div>
                    <p style={{ 
                      color: darkMode ? '#94a3b8' : '#64748b',
                      textAlign: 'center'
                    }}>
                      Carregando comparação...
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px' }}>
                    <CityComparison 
                      cities={data ? [data.city, comparisonCity] : [data?.city || 'São Paulo', comparisonCity]}
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Gráfico de temperaturas previstas para a cidade principal */}
          {data && forecast && forecast.length > 0 && (
            <div style={{ marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }}>Temperaturas Previstas - {data.city}</h2>
              </div>
              <div style={{ padding: '16px' }}>
                <ForecastChart data={forecast} darkMode={darkMode} />
              </div>
            </div>
          )}
          
          {/* Gráfico de temperaturas previstas para a cidade de comparação */}
          {comparisonCity && comparisonForecast && comparisonForecast.length > 0 && (
            <div style={{ marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }}>Temperaturas Previstas - {comparisonCity}</h2>
              </div>
              <div style={{ padding: '16px' }}>
                <ForecastChart data={comparisonForecast} darkMode={darkMode} />
              </div>
            </div>
          )}
          
          {/* Mensagem quando não há previsão para cidade de comparação */}
          {comparisonCity && !comparisonForecast && comparisonForecast !== null && (
            <div style={{ marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }}>Temperaturas Previstas - {comparisonCity}</h2>
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px', color: darkMode ? '#94a3b8' : '#64748b' }}>🌤️</div>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center' }}>Previsão do tempo não disponível para {comparisonCity}</p>
              </div>
            </div>
          )}          

          {!data && searchTried && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', marginTop: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '16px' }}>Nenhuma cidade selecionada</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Digite o nome de uma cidade no campo acima para ver sua qualidade de vida urbana</p>
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