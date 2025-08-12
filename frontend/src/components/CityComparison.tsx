import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonData {
  city: string;
  iqv_overall: number;
  iqv_climate: number;
  iqv_humidity: number;
  iqv_traffic: number;
}

interface CityComparisonProps {
  cities: string[];
  darkMode?: boolean;
  shouldFetch?: boolean;
}

export const CityComparison = ({ 
  cities, 
  darkMode, 
  shouldFetch = false
}: CityComparisonProps) => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparisonCache, setComparisonCache] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchDataWithCache = async (cityName: string) => {
      if (comparisonCache[cityName]) {
        return comparisonCache[cityName];
      }
      
      try {
        const response = await fetch(`/api/iqv?city=${encodeURIComponent(cityName)}`);
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
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados de comparação');
        return null;
      }
    };

    const fetchData = async () => {
      if (!shouldFetch && !hasFetched) return;
      
      try {
        setLoading(true);
        setError(null);
        const promises = cities.map(city => fetchDataWithCache(city));
        const results = await Promise.all(promises);
        
        const validResults = results.filter(Boolean) as any[];
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
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao processar comparação');
      } finally {
        setLoading(false);
      }
    };
    
    if (cities.length > 1) fetchData();
  }, [cities, shouldFetch]);

  if (cities.length < 2 && !hasFetched) return null;
  
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: darkMode ? '#e2e8f0' : '#1e293b'
      }}>
        Carregando comparação...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: darkMode ? '#ef4444' : '#dc2626'
      }}>
        {error}
      </div>
    );
  }

  if (data.length === 0 && hasFetched) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: darkMode ? '#e2e8f0' : '#1e293b'
      }}>
        Nenhum dado disponível para comparação
      </div>
    );
  }

  const barColors = {
    iqv_overall: darkMode ? '#3b82f6' : '#2563eb',
    iqv_climate: darkMode ? '#10b981' : '#059669',
    iqv_humidity: darkMode ? '#eab308' : '#d97706',
    iqv_traffic: darkMode ? '#f97316' : '#ea580c'
  };

  return (
    <div style={{ 
      backgroundColor: darkMode ? '#1e293b' : 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginTop: '24px',
      color: darkMode ? '#e2e8f0' : '#1e293b'
    }}>
      <h2 style={{ 
        marginBottom: '16px', 
        color: darkMode ? '#e2e8f0' : '#1e293b',
        fontSize: '1.25rem',
        fontWeight: '600'
      }}>
        Comparação Detalhada
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ 
            marginBottom: '12px', 
            color: darkMode ? '#e2e8f0' : '#1e293b',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Índice de Qualidade de Vida (IQV)
          </h3>
          <ResponsiveContainer
            width="100%"
            height={400}
            style={{
              zIndex: 100,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              layout="horizontal"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? '#334155' : '#e2e8f0'} 
              />
              <XAxis 
                dataKey="city" 
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                tickCount={11}
              />
              <Tooltip 
                contentStyle={darkMode ? { 
                  backgroundColor: '#1e293b', 
                  borderColor: '#334155',
                  color: '#e2e8f0'
                } : { 
                  backgroundColor: 'white', 
                  borderColor: '#e2e8f0',
                  color: '#1e293b'
                }}
                formatter={(value) => [`${Number(value).toFixed(1)}`, 'IQV']}
                labelFormatter={(label) => `Cidade: ${label}`}
                wrapperStyle={{ zIndex: 101 }}
              />
              <Legend 
                wrapperStyle={darkMode ? { color: '#e2e8f0' } : { color: '#1e293b' }}
              />
              <Bar 
                dataKey="iqv_overall" 
                name="IQV Geral" 
                fill={barColors.iqv_overall} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="iqv_climate" 
                name="IQV Clima" 
                fill={barColors.iqv_climate} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="iqv_humidity" 
                name="IQV Umidade" 
                fill={barColors.iqv_humidity} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="iqv_traffic" 
                name="IQV Trânsito" 
                fill={barColors.iqv_traffic} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};