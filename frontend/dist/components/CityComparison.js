import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
export const CityComparison = ({ cities, darkMode, shouldFetch = false }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comparisonCache, setComparisonCache] = useState({});
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    useEffect(() => {
        const fetchDataWithCache = async (cityName) => {
            if (comparisonCache[cityName]) {
                return comparisonCache[cityName];
            }
            try {
                const response = await fetch(`https://city-sense.vercel.app/api/iqv?city=${encodeURIComponent(cityName)}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError(`Cidade "${cityName}" não encontrada`);
                        return null;
                    }
                    throw new Error(`Erro ${response.status}`);
                }
                const data = await response.json();
                setComparisonCache(prev => ({ ...prev, [cityName]: data }));
                return data;
            }
            catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError('Erro ao carregar dados de comparação');
                return null;
            }
        };
        const fetchData = async () => {
            if (!shouldFetch && !hasFetched)
                return;
            try {
                setLoading(true);
                setError(null);
                const promises = cities.map(city => fetchDataWithCache(city));
                const results = await Promise.all(promises);
                const validResults = results.filter(Boolean);
                if (validResults.length < 2) {
                    setError('Dados insuficientes para comparação');
                    return;
                }
                // Formatação dos dados
                const formattedData = validResults.map(cityData => ({
                    city: cityData.city,
                    iqv_overall: Number(cityData.iqv_overall),
                    iqv_climate: Number(cityData.iqv_climate),
                    iqv_humidity: Number(cityData.iqv_humidity),
                    iqv_traffic: Number(cityData.iqv_traffic)
                }));
                setData(formattedData);
                console.log('Dados formatados:', formattedData); // Para depuração
                setHasFetched(true);
            }
            catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError('Erro ao processar comparação');
            }
            finally {
                setLoading(false);
            }
        };
        if (cities.length > 1)
            fetchData();
    }, [cities, shouldFetch]);
    if (cities.length < 2 && !hasFetched)
        return null;
    if (loading) {
        return (_jsx("div", { style: {
                padding: '20px',
                textAlign: 'center',
                color: darkMode ? '#e2e8f0' : '#1e293b'
            }, children: "Carregando compara\u00E7\u00E3o..." }));
    }
    if (error) {
        return (_jsx("div", { style: {
                padding: '20px',
                textAlign: 'center',
                color: darkMode ? '#ef4444' : '#dc2626'
            }, children: error }));
    }
    if (data.length === 0 && hasFetched) {
        return (_jsx("div", { style: {
                padding: '20px',
                textAlign: 'center',
                color: darkMode ? '#e2e8f0' : '#1e293b'
            }, children: "Nenhum dado dispon\u00EDvel para compara\u00E7\u00E3o" }));
    }
    const barColors = {
        iqv_overall: darkMode ? '#3b82f6' : '#2563eb',
        iqv_climate: darkMode ? '#10b981' : '#059669',
        iqv_humidity: darkMode ? '#eab308' : '#d97706',
        iqv_traffic: darkMode ? '#f97316' : '#ea580c'
    };
    return (_jsxs("div", { style: {
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginTop: '24px',
            color: darkMode ? '#e2e8f0' : '#1e293b'
        }, children: [_jsx("h2", { style: {
                    marginBottom: '16px',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                }, children: "Compara\u00E7\u00E3o Detalhada" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: _jsxs("div", { children: [_jsx("h3", { style: {
                                marginBottom: '12px',
                                color: darkMode ? '#e2e8f0' : '#1e293b',
                                fontSize: '1rem',
                                fontWeight: '500'
                            }, children: "\u00CDndice de Qualidade de Vida (IQV)" }), _jsx(ResponsiveContainer, { width: "100%", height: 400, style: {
                                zIndex: 100,
                                position: 'relative',
                                overflow: 'visible',
                            }, children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 50 }, layout: "horizontal", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: darkMode ? '#334155' : '#e2e8f0' }), _jsx(XAxis, { dataKey: "city", stroke: darkMode ? '#94a3b8' : '#64748b', angle: -45, textAnchor: "end", height: 60 }), _jsx(YAxis, { domain: [0, 10], stroke: darkMode ? '#94a3b8' : '#64748b', tickCount: 11 }), _jsx(Tooltip, { contentStyle: darkMode ? {
                                            backgroundColor: '#1e293b',
                                            borderColor: '#334155',
                                            color: '#e2e8f0'
                                        } : {
                                            backgroundColor: 'white',
                                            borderColor: '#e2e8f0',
                                            color: '#1e293b'
                                        }, formatter: (value) => [`${Number(value).toFixed(1)}`, 'IQV'], labelFormatter: (label) => `Cidade: ${label}`, wrapperStyle: { zIndex: 101 } }), _jsx(Legend, { wrapperStyle: darkMode ? { color: '#e2e8f0' } : { color: '#1e293b' } }), _jsx(Bar, { dataKey: "iqv_overall", name: "IQV Geral", fill: barColors.iqv_overall, radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "iqv_climate", name: "IQV Clima", fill: barColors.iqv_climate, radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "iqv_humidity", name: "IQV Umidade", fill: barColors.iqv_humidity, radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "iqv_traffic", name: "IQV Tr\u00E2nsito", fill: barColors.iqv_traffic, radius: [4, 4, 0, 0] })] }) })] }) })] }));
};
//# sourceMappingURL=CityComparison.js.map