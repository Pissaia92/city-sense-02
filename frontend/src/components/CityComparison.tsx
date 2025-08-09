import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonData {
  city: string;
  iqv_overall: number;
  iqv_climate: number;
  iqv_humidity: number;
  iqv_traffic: number;
}

export const CityComparison = ({ cities, darkMode }: { cities: string[]; darkMode?: boolean }) => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonCache, setComparisonCache] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchDataWithCache = async (cityName: string) => {
      if (comparisonCache[cityName]) {
        return comparisonCache[cityName];
      }
      
      try {
        const response = await fetch(`/api/iqv?city=${encodeURIComponent(cityName)}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Cidade não encontrada');
            return null;
          }
          throw new Error(`Erro ${response.status}`);
        }
        const data = await response.json();
        setComparisonCache(prev => ({ ...prev, [cityName]: data }));
        return data;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return null;
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const promises = cities.map(city => fetchDataWithCache(city));
        const results = await Promise.all(promises);
        
        const validResults = results.filter(Boolean) as any[];
        setData(validResults.map(cityData => ({
          city: cityData.city,
          iqv_overall: cityData.iqv_overall,
          iqv_climate: cityData.iqv_climate,
          iqv_humidity: cityData.iqv_humidity,
          iqv_traffic: cityData.iqv_traffic
        })));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (cities.length > 1) fetchData();
  }, [cities]);
  
  if (cities.length < 2) return null;
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando comparação...</div>;
  
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
      <h2 style={{ marginBottom: '16px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>Comparação de Cidades</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '12px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>IQV por Categoria</h3>
          <ResponsiveContainer width="100%" height={400}>
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