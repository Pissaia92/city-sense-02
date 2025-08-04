// src/components/ForecastChart.tsx
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { DateTime } from 'luxon';
import type { ForecastPoint } from './Types/types';

interface Props {
  data: ForecastPoint[] | null;
  darkMode: boolean;
}

/**
 * Converte descrição do clima em emoji
 */
const getWeatherIcon = (condition: string) => {
  const desc = condition.toLowerCase();
  if (desc.includes('chuva') || desc.includes('storm') || desc.includes('rain')) return '🌧️';
  if (desc.includes('nublado') || desc.includes('cloud')) return '☁️';
  if (desc.includes('sol') || desc.includes('clear') || desc.includes('sun')) return '☀️';
  if (desc.includes('neve') || desc.includes('snow')) return '❄️';
  if (desc.includes('tempestade') || desc.includes('thunder')) return '⛈️';
  return '🌤️';
};

/**
 * Retorna cor do ícone baseado na temperatura
 */
const getTempColor = (temp: number) => {
  if (temp >= 30) return '#f97316'; // Laranja para calor
  if (temp >= 25) return '#eab308'; // Amarelo
  if (temp >= 20) return '#22c55e'; // Verde
  if (temp >= 15) return '#3b82f6'; // Azul
  return '#8b5cf6'; // Roxo para frio
};

export const ForecastChart: React.FC<Props> = ({ data }) => {
  // Formata a data para exibição no eixo X (ex: "Seg, 06")
  const formatXAxis = (dateString: string) => {
    return DateTime.fromISO(dateString)
      .setLocale('pt-BR')
      .toFormat('EEE, dd')
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  // Formata a tooltip
  const formatTooltip = (value: number) => `${value}°C`;

  // Retorna cor da linha baseada na temperatura
  const getLineColor = () => {
    if (!data || data.length === 0) return '#94a3b8';
    
    const avgTemp = data.reduce((sum, day) => sum + day.temp, 0) / data.length;
    if (avgTemp >= 30) return '#f97316';
    if (avgTemp >= 25) return '#eab308';
    if (avgTemp >= 20) return '#22c55e';
    return '#3b82f6';
  };

  const lineColor = getLineColor();

  // Verifica se há dados válidos
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginTop: '24px',
        height: 360,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2.5rem', 
            marginBottom: '12px',
            opacity: 0.5
          }}>
            📅
          </div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Previsão climática
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Aguardando dados da cidade selecionada...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginTop: '24px',
      position: 'relative'
    }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        marginBottom: '16px',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🌤️</span> Previsão e temperatura média para os próximos 7 dias
      </h2>
      
      <div style={{ width: '100%', height: 300, position: 'relative' }}>
        <ResponsiveContainer>
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#64748b"
              fontSize={12}
              height={60}
            />
            <YAxis 
              unit="°C" 
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke="#64748b"
              fontSize={12}
              width={40}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(date) => 
                DateTime.fromISO(date).toFormat("EEEE, dd 'de' MMMM", { locale: 'pt-BR' })
              }
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ 
                color: 'white',
                padding: '4px 0'
              }}
              labelStyle={{
                fontWeight: 'bold',
                marginBottom: '4px'
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke={lineColor}
              strokeWidth={3}
              dot={{
                r: 6,
                stroke: lineColor,
                strokeWidth: 2,
                fill: "white"
              }}
              activeDot={{
                r: 8,
                stroke: lineColor,
                strokeWidth: 2,
                fill: "#ffffff"
              }}
            />
            
            {/* Linha de referência para temperatura média */}
            <ReferenceLine 
              y={data.reduce((sum, day) => sum + day.temp, 0) / data.length} 
              stroke={lineColor} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Média', 
                position: 'right', 
                fill: lineColor,
                fontSize: 12
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Ícones climáticos posicionados abaixo do gráfico */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 45px 10px 30px',
          pointerEvents: 'none'
        }}>
          {data.map((day, index) => (
            <div 
              key={index}
              style={{
                textAlign: 'center',
                fontSize: '1.4rem',
                transform: 'translateY(5px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              title={`${day.condition} - ${day.temp}°C`}
            >
              <span style={{ 
                display: 'block',
                color: getTempColor(day.temp),
                fontSize: '1.2rem'
              }}>
                {getWeatherIcon(day.condition)}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: 500,
                display: 'block',
                marginTop: '2px'
              }}>
                {day.temp}°
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legenda de cores */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f97316'
          }}></span>
          <span>30°C+</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#eab308'
          }}></span>
          <span>25-29°C</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#22c55e'
          }}></span>
          <span>20-24°C</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6'
          }}></span>
          <span>20°C</span>
        </div>
      </div>
    </div>
  );
};