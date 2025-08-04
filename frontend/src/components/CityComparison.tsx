// src/components/CityComparison.tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  city: string;
  iqv: number;
  temperature: number;
  humidity: number;
}

export const CityComparison = ({ cities }: { cities: string[] }) => {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const results = await Promise.all(
        cities.map(city => 
          fetch(`/api/iqv?city=${encodeURIComponent(city)}`)
            .then(res => res.json())
            .catch(() => null)
        )
      );
      
      setData(results.filter(Boolean).map(cityData => ({
        city: cityData.city,
        iqv: cityData.iqv_overall,
        temperature: cityData.temperature,
        humidity: cityData.humidity
      })));
      setLoading(false);
    };
    
    if (cities.length > 1) fetchData();
  }, [cities]);
  
  if (cities.length < 2) return null;
  if (loading) return <div>Carregando comparação...</div>;
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginTop: '24px'
    }}>
      <h2 style={{ marginBottom: '16px' }}>Comparação de Cidades</h2>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <h3>IQV Geral</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="iqv" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Temperatura (°C)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="temperature" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};