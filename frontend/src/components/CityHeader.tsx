import React from 'react';
import { DateTime } from 'luxon';

interface CityHeaderProps {
  data: any;
  dataFormatada: string;
  getWeatherIcon: () => string;
  darkMode?: boolean;
}

export const CityHeader = ({ data, dataFormatada, getWeatherIcon, darkMode = false }: CityHeaderProps) => {
  return (
    <div style={{
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: darkMode ? '#f1f5f9' : '#0f172a'
          }}>
            {data.city}, {data.country}
          </h2>
          {/* <p style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            Atualizado em: {dataFormatada}
          </p> */}
        </div>
        <div style={{
          fontSize: '3.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          {getWeatherIcon()}
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '16px'
      }}>
        <div style={{
          backgroundColor: darkMode ? '#334155' : '#f1f5f8',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <p style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem',
            margin: '0 0 4px 0'
          }}>
            Temperatura
          </p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
            color: darkMode ? '#f1f5f9' : '#0f172a'
          }}>
            {data.temperature}°C
          </p>
        </div>
        
        <div style={{
          backgroundColor: darkMode ? '#334155' : '#f1f5f8',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <p style={{
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem',
            margin: '0 0 4px 0'
          }}>
            Umidade
          </p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
            color: darkMode ? '#f1f5f9' : '#0f172a'
          }}>
            {data.humidity}%
          </p>
        </div>
      </div>
    </div>
  );
};