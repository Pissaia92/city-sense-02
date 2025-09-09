import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Definição de Tipos ---
// Tipo para os dados brutos da API local
interface LocalAPIResponse {
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
  timestamp: string;
}
// Tipo para os dados formatados para o gráfico (esperado pelo componente)
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
  darkMode = false, // Valor padrão adicionado
  shouldFetch = false
}: CityComparisonProps) => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparisonCache, setComparisonCache] = useState<Record<string, LocalAPIResponse>>({});
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // --- Função para buscar dados da API LOCAL com cache ---
  const fetchDataWithCache = async (cityName: string): Promise<LocalAPIResponse | null> => {
    if (comparisonCache[cityName]) {
      return comparisonCache[cityName];
    }
    try {
      // --- URL da API LOCAL ---
      const response = await fetch(`http://localhost:8000/api/predict/iqv?city=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(`City "${cityName}" not found`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LocalAPIResponse = await response.json();
      console.log(`Raw API data for ${cityName}:`, data);
      setComparisonCache(prev => ({ ...prev, [cityName]: data }));
      return data;
    } catch (error: any) {
      console.error(`Error fetching data for ${cityName}:`, error);
      setError(`Error loading data for ${cityName}: ${error.message}`);
      return null;
    }
  };
  // --- Efeito para buscar dados das cidades ---
  useEffect(() => {
    const fetchData = async () => {
      // Só busca se shouldFetch for true ou se ainda não buscou e tem cidades
      if ((!shouldFetch && hasFetched) || cities.length < 2) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const promises = cities.map(city => fetchDataWithCache(city));
        const results = await Promise.all(promises);
        
        // Filtra resultados válidos
        const validResults = results.filter((result): result is LocalAPIResponse => result !== null);

        // --- Formatação dos dados da API LOCAL para o formato do gráfico ---
        const formattedData: ComparisonData[] = validResults.map(cityData => {
             // Exemplo de cálculo para iqv_climate
             const climateQualityValue = ((cityData.temp_normalized * 0.6) + ((cityData.humidity_score / 6) * 0.4)) * 10; // Escala 0-10

             return {
                city: cityData.city,
                // iqv_overall é o predicted_iqv da API local
                iqv_overall: Number(cityData.predicted_iqv.toFixed(2)),
                // iqv_climate calculado a partir de temp_normalized e humidity_score
                iqv_climate: Number(climateQualityValue.toFixed(2)),
                // iqv_humidity pode ser humidity_score normalizado (ex: humidity_score / 6 * 10)
                iqv_humidity: Number(((cityData.humidity_score / 6) * 10).toFixed(2)),
                // iqv_traffic é o traffic_score da API local (assumindo escala 0-10)
                iqv_traffic: Number(cityData.traffic_score),
             };
        });

        setData(formattedData);
        console.log('Formatted comparison data:', formattedData);
        setHasFetched(true);
      } catch (error: any) {
        console.error('Error processing comparison data:', error);
        setError('Error processing comparison data: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cities, shouldFetch, hasFetched, comparisonCache]); // Adiciona dependências

  // --- Renderização Condicional ---
  if (cities.length < 2 && !hasFetched) return null;
  
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: darkMode ? '#e2e8f0' : '#1e293b'
      }}>
        Loading comparison...
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
        No data available for comparison
      </div>
    );
  }

  // --- Cores para o gráfico ---
  const barColors = {
    iqv_overall: darkMode ? '#3b82f6' : '#2563eb',
    iqv_climate: darkMode ? '#10b981' : '#059669',
    iqv_humidity: darkMode ? '#eab308' : '#d97706',
    iqv_traffic: darkMode ? '#f97316' : '#ea580c'
  };

  // --- Renderização Principal ---
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
        Detailed Comparison
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ 
            marginBottom: '12px', 
            color: darkMode ? '#e2e8f0' : '#1e293b',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Quality of Life index (QoL)
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