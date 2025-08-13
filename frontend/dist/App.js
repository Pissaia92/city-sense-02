import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useContext, useRef } from 'react';
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
const AppContent = () => {
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(null);
    const [inputCity, setInputCity] = useState('São Paulo');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [searchTried, setSearchTried] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [showMainSuggestions, setShowMainSuggestions] = useState(false);
    const [showComparisonSuggestions, setShowComparisonSuggestions] = useState(false);
    const [mainSuggestions, setMainSuggestions] = useState([]);
    const mainSearchRef = useRef(null);
    const comparisonSearchRef = useRef(null);
    const [comparisonSuggestions, setComparisonSuggestions] = useState([]);
    const [mlPrediction, setMLPrediction] = useState(null);
    const [comparisonCity, setComparisonCity] = useState('');
    const [comparisonForecast, setComparisonForecast] = useState(null);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const getIQVColor = (iqv, darkMode) => iqv >= 8 ? (darkMode ? '#10b981' : '#047857') :
        iqv >= 6 ? (darkMode ? '#84cc16' : '#65a30d') :
            iqv >= 4 ? (darkMode ? '#eab308' : '#ca8a04') :
                iqv >= 2 ? (darkMode ? '#f97316' : '#c2410c') :
                    (darkMode ? '#ef4444' : '#b91c1c');
    const dataFormatada = data ? DateTime.fromISO(data.updated_at).setZone('America/Sao_Paulo').toFormat("dd/MM/yyyy 'às' HH:mm") : '';
    const fetchSuggestions = async (query, isComparison = false) => {
        if (!query.trim()) {
            if (isComparison)
                setComparisonSuggestions([]);
            else
                setMainSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`/api/iqv?city=${encodeURIComponent(query)}`);
            if (response.ok) {
                const suggestions = await response.json();
                if (isComparison)
                    setComparisonSuggestions(suggestions);
                else
                    setMainSuggestions(suggestions);
            }
        }
        catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            if (isComparison)
                setComparisonSuggestions([]);
            else
                setMainSuggestions([]);
        }
    };
    const handleMainInputChange = (value) => {
        setInputCity(value);
        setMainSuggestions([]);
    };
    const handleComparisonInputChange = (value) => {
        setComparisonCity(value);
        setComparisonSuggestions([]);
    };
    const selectMainSuggestion = (suggestion) => {
        setInputCity(suggestion);
        setShowMainSuggestions(false);
        fetchData(suggestion);
    };
    const selectComparisonSuggestion = (suggestion) => {
        setComparisonCity(suggestion);
        setShowComparisonSuggestions(false);
    };
    const fetchData = async (cityName) => {
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
                }
                else {
                    setError(`⚠️ ${errorMessage}`);
                }
                setData(null);
                return;
            }
            const result = await response.json();
            console.log('✅ Dados recebidos:', result);
            setData(result);
            setCity(formattedCity);
        }
        catch (err) {
            console.error('🚨 Erro na busca:', err);
            if (err.name === 'AbortError') {
                setError('⏳ Tempo limite excedido. Tente novamente.');
            }
            else if (err.message.includes('Failed to fetch')) {
                setError('🔌 Erro de conexão. Verifique se o backend está rodando em http://localhost:8000');
            }
            else {
                setError(`⚠️ ${err.message || 'Erro inesperado ao carregar os dados'}`);
            }
            setData(null);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchForecast = async (cityName) => {
        const cityToFetch = cityName || city;
        if (!cityToFetch)
            return;
        try {
            console.log(`🌤️ Buscando previsão para: ${cityToFetch}`);
            const response = await fetch(`/api/forecast?city=${encodeURIComponent(cityToFetch)}`, {
                signal: AbortSignal.timeout(8000)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || `Erro ${response.status}: ${response.statusText}`;
                console.warn('⚠️ Previsão não disponível:', errorMessage);
                if (cityName === comparisonCity)
                    setComparisonForecast(null);
                else
                    setForecast(null);
                return;
            }
            const result = await response.json();
            console.log('🌤️ Previsão carregada:', result.forecast);
            if (cityName === comparisonCity)
                setComparisonForecast(result.forecast);
            else
                setForecast(result.forecast);
        }
        catch (err) {
            console.error('⚠️ Erro na previsão:', err);
            if (cityName === comparisonCity)
                setComparisonForecast(null);
            else
                setForecast(null);
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mainSearchRef.current && !mainSearchRef.current.contains(event.target))
                setShowMainSuggestions(false);
            if (comparisonSearchRef.current && !comparisonSearchRef.current.contains(event.target))
                setShowComparisonSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        if (!searchTried)
            fetchData('São Paulo');
        const interval = setInterval(() => { if (city)
            fetchData(city); }, 60000);
        return () => clearInterval(interval);
    }, [city, searchTried]);
    useEffect(() => {
        if (city) {
            fetchForecast();
            const interval = setInterval(() => { fetchForecast(); if (comparisonCity)
                fetchForecast(comparisonCity); }, 300000);
            return () => clearInterval(interval);
        }
    }, [city, comparisonCity]);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!inputCity.trim()) {
            setError('Por favor, insira uma cidade');
            return;
        }
        setLoading(true);
        setError(null);
        await fetchData(inputCity);
    };
    const handleCitySelect = (selectedCity) => { setInputCity(selectedCity); fetchData(selectedCity); setShowSuggestions(false); };
    const handleCompareCities = () => {
        if (comparisonCity.trim() && data) {
            setComparisonLoading(true);
            fetchForecast(comparisonCity);
            console.log(`Comparando ${data.city} com ${comparisonCity}`);
            setTimeout(() => setComparisonLoading(false), 3000);
        }
    };
    const formatTrafficDelay = (delay) => delay <= 0 ? '0 minutos' : `${Math.round(delay)} minutos`;
    const cityData = data ? {
        longitude: data.longitude,
        latitude: data.latitude,
        iqv: data.iqv_overall,
        city: data.city,
        country: data.country
    } : null;
    useEffect(() => {
        if (city && data) {
            const fetchMLPrediction = async () => { try {
                const response = await fetch(`/api/predict/iqv?city=${encodeURIComponent(city)}`);
                if (response.ok) {
                    const prediction = await response.json();
                    setMLPrediction(prediction);
                }
            }
            catch (err) {
                console.error('Erro ao buscar previsão do ML:', err);
            } };
            fetchMLPrediction();
            const interval = setInterval(fetchMLPrediction, 1800000);
            return () => clearInterval(interval);
        }
    }, [city, data]);
    return (_jsx(_Fragment, { children: _jsx("div", { style: {
                width: '100%',
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                minHeight: '100vh',
                transition: 'background-color 0.3s ease, color 0.3s ease'
            }, children: _jsxs("div", { style: {
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    padding: '20px',
                    color: darkMode ? '#e2e8f0' : '#1e293b'
                }, children: [_jsx(Header, { data: data, city: city || 'Carregando...', darkMode: darkMode, toggleDarkMode: toggleDarkMode }), _jsx(SearchBar, { inputCity: inputCity, showSuggestions: showMainSuggestions, suggestedCities: mainSuggestions, setInputCity: setInputCity, setShowSuggestions: setShowMainSuggestions, handleSearch: handleSearch, handleCitySelect: handleCitySelect, isSearching: loading, darkMode: darkMode, searchRef: mainSearchRef, onSelectSuggestion: selectMainSuggestion }), !searchTried && (_jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '50vh',
                            backgroundColor: darkMode ? '#1e293b' : 'white',
                            borderRadius: '12px',
                            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }, children: [_jsx("div", { style: { fontSize: '3rem', marginBottom: '16px', animation: 'pulse 2s infinite' }, children: "\uD83C\uDF0D" }), _jsx("h2", { style: { fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#475569', marginBottom: '8px' }, children: "Carregando cidade inicial" }), _jsx("p", { style: { color: darkMode ? '#94a3b8' : '#64748b' }, children: "Buscando dados para S\u00E3o Paulo..." }), _jsx("style", { children: `@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }` })] })), loading && searchTried && !data && _jsx(LoadingState, { darkMode: darkMode }), error && (_jsx(ErrorState, { error: error, onRetry: () => city ? fetchData(city) : fetchData(inputCity), darkMode: darkMode })), data && !loading && !error && (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginBottom: '32px' }, children: [_jsxs("div", { children: [_jsx(CityHeader, { data: data, dataFormatada: dataFormatada, getWeatherIcon: () => { const desc = data.description.toLowerCase(); if (desc.includes('chuva') || desc.includes('storm'))
                                            return '⛈️'; if (desc.includes('nublado') || desc.includes('cloud'))
                                            return '☁️'; if (desc.includes('sol') || desc.includes('clear'))
                                            return '☀️'; if (desc.includes('neve'))
                                            return '❄️'; return '🌤️'; }, darkMode: darkMode }), _jsx(MetricsGrid, { data: data, formatTrafficDelay: formatTrafficDelay, darkMode: darkMode })] }), _jsxs("div", { children: [_jsx(IQVBreakdown, { data: data, darkMode: darkMode }), _jsx(IQVTips, { data: data, darkMode: darkMode })] })] })), data && !loading && !error && (_jsxs("div", { style: { marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }, children: [_jsx("div", { style: { padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }, children: _jsx("h2", { style: { fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }, children: "Previs\u00E3o de IQV com M.L." }) }), _jsx("div", { style: { padding: '16px' }, children: mlPrediction ? (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '10px' }, children: "IQV Atual" }), _jsx("div", { style: { fontSize: '2.5rem', fontWeight: 'bold', color: getIQVColor(data.iqv_overall, darkMode) }, children: data.iqv_overall.toFixed(1) })] }), _jsxs("div", { children: [_jsx("h3", { style: { color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '10px' }, children: "IQV Previsto" }), _jsx("div", { style: { fontSize: '2.5rem', fontWeight: 'bold', color: getIQVColor(mlPrediction.predicted_iqv, darkMode) }, children: mlPrediction.predicted_iqv.toFixed(1) }), _jsx("p", { style: { color: darkMode ? '#94a3b8' : '#64748b', marginTop: '5px' }, children: mlPrediction.predicted_iqv > data.iqv_overall ? "📈 Tendência positiva" : mlPrediction.predicted_iqv < data.iqv_overall ? "📉 Tendência negativa" : "➡️ Estabilidade" })] })] })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }, children: [_jsx("div", { style: { fontSize: '2rem', marginBottom: '10px', color: darkMode ? '#94a3b8' : '#64748b' }, children: "\uD83E\uDD16" }), _jsx("p", { style: { color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center' }, children: "Processando previs\u00E3o do IQV com machine learning..." })] })) })] })), data && (_jsxs("div", { style: {
                            marginBottom: '32px',
                            backgroundColor: darkMode ? '#1e293b' : 'white',
                            borderRadius: '12px',
                            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden'
                        }, children: [_jsx("div", { style: {
                                    padding: '16px',
                                    borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                                }, children: _jsx("h2", { style: {
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: darkMode ? '#cbd5e1' : '#1e293b'
                                    }, children: "Compara\u00E7\u00E3o de Cidades" }) }), _jsx("div", { style: { padding: '16px' }, children: _jsx("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { style: {
                                                    fontWeight: '600',
                                                    color: darkMode ? '#e2e8f0' : '#1e293b'
                                                }, children: "Digite a cidade para compara\u00E7\u00E3o:" }), _jsx("div", { ref: comparisonSearchRef, style: { position: 'relative', flex: 1 }, children: _jsx("input", { type: "text", value: comparisonCity, onChange: (e) => handleComparisonInputChange(e.target.value), placeholder: "Ex: Rio de Janeiro", style: {
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                                        backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                                                        color: darkMode ? '#e2e8f0' : '#1e293b',
                                                        width: '100%'
                                                    } }) }), _jsx("button", { onClick: handleCompareCities, disabled: comparisonLoading, style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: comparisonLoading ? 'not-allowed' : 'pointer',
                                                    fontWeight: '600'
                                                }, children: comparisonLoading ? 'Carregando...' : 'Comparar' })] }) }) })] })), data && comparisonCity.trim() !== '' && (_jsxs("div", { style: {
                            marginBottom: '32px',
                            backgroundColor: darkMode ? '#1e293b' : 'white',
                            borderRadius: '12px',
                            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden'
                        }, children: [_jsx("div", { style: {
                                    padding: '16px',
                                    borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                                }, children: _jsx("h2", { style: {
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: darkMode ? '#cbd5e1' : '#1e293b'
                                    }, children: "Compara\u00E7\u00E3o de Cidades" }) }), _jsx("div", { style: { padding: '16px' }, children: comparisonLoading ? (_jsxs("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }, children: [_jsx("div", { style: {
                                                fontSize: '2rem',
                                                marginBottom: '10px',
                                                color: darkMode ? '#94a3b8' : '#64748b'
                                            }, children: "\uD83D\uDD04" }), _jsx("p", { style: {
                                                color: darkMode ? '#94a3b8' : '#64748b',
                                                textAlign: 'center'
                                            }, children: "Carregando compara\u00E7\u00E3o..." })] })) : (_jsx("div", { style: { marginTop: '16px' }, children: _jsx(CityComparison, { cities: data ? [data.city, comparisonCity] : ['São Paulo', comparisonCity], darkMode: darkMode, shouldFetch: true }) })) })] })), data && forecast && forecast.length > 0 && (_jsxs("div", { style: { marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }, children: [_jsx("div", { style: { padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }, children: _jsxs("h2", { style: { fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }, children: ["Temperaturas Previstas - ", data.city] }) }), _jsx("div", { style: { padding: '16px' }, children: _jsx(ForecastChart, { data: forecast || [], darkMode: darkMode }) })] })), comparisonCity && comparisonForecast && comparisonForecast.length > 0 && (_jsxs("div", { style: { marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }, children: [_jsx("div", { style: { padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }, children: _jsxs("h2", { style: { fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }, children: ["Temperaturas Previstas - ", comparisonCity] }) }), _jsx("div", { style: { padding: '16px' }, children: _jsx(ForecastChart, { data: comparisonForecast || [], darkMode: darkMode }) })] })), comparisonCity && !comparisonForecast && comparisonForecast !== null && (_jsxs("div", { style: { marginBottom: '32px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }, children: [_jsx("div", { style: { padding: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }, children: _jsxs("h2", { style: { fontSize: '1.5rem', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#1e293b' }, children: ["Temperaturas Previstas - ", comparisonCity] }) }), _jsxs("div", { style: { padding: '16px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '2rem', marginBottom: '10px', color: darkMode ? '#94a3b8' : '#64748b' }, children: "\uD83C\uDF24\uFE0F" }), _jsxs("p", { style: { color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center' }, children: ["Previs\u00E3o do tempo n\u00E3o dispon\u00EDvel para ", comparisonCity] })] })] })), !data && searchTried && !loading && !error && (_jsxs("div", { style: { textAlign: 'center', padding: '40px 20px', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)', marginTop: '24px' }, children: [_jsx("h2", { style: { fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#1e293b', marginBottom: '16px' }, children: "Nenhuma cidade selecionada" }), _jsx("p", { style: { color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }, children: "Digite o nome de uma cidade no campo acima para ver sua qualidade de vida urbana" })] })), _jsx(Footer, { darkMode: darkMode })] }) }) }));
};
const App = () => (_jsx(ThemeProvider, { children: _jsx(AppContent, {}) }));
export default App;
//# sourceMappingURL=App.js.map