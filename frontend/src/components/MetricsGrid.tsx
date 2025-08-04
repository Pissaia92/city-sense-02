import React from 'react';

interface MetricsGridProps {
  data: any;
  formatTrafficDelay: (delay: number) => string;
  darkMode?: boolean;
}

export const MetricsGrid = ({ data, formatTrafficDelay, darkMode = false }: MetricsGridProps) => {
  const metrics = [
    {
      title: "IQV Geral",
      value: data.iqv_overall,
      description: "Índice geral de qualidade de vida",
      color: data.iqv_overall >= 7 ? '#10b981' : data.iqv_overall >= 5 ? '#eab308' : '#ef4444'
    },
    {
      title: "IQV Clima",
      value: data.iqv_climate,
      description: "Qualidade do clima local",
      color: data.iqv_climate >= 7 ? '#10b981' : data.iqv_climate >= 5 ? '#eab308' : '#ef4444'
    },
    {
      title: "IQV Umidade",
      value: data.iqv_humidity,
      description: "Nível de conforto da umidade",
      color: data.iqv_humidity >= 7 ? '#10b981' : data.iqv_humidity >= 5 ? '#eab308' : '#ef4444'
    },
    {
      title: "IQV Trânsito",
      value: data.iqv_traffic,
      description: "Qualidade do trânsito",
      color: data.iqv_traffic >= 7 ? '#10b981' : data.iqv_traffic >= 5 ? '#eab308' : '#ef4444'
    }
  ];

  return (
    <div style={{
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: darkMode ? '#f1f5f9' : '#1e293b'
      }}>
        Métricas Detalhadas
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {metrics.map((metric, index) => (
          <div 
            key={index}
            style={{
              backgroundColor: darkMode ? '#334155' : '#f1f5f8',
              padding: '16px',
              borderRadius: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '0.875rem',
              margin: '0 0 4px 0'
            }}>
              {metric.title}
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0',
              color: metric.color
            }}>
              {metric.value.toFixed(1)}/10
            </p>
            <p style={{
              color: darkMode ? '#cbd5e1' : '#475569',
              fontSize: '0.875rem',
              margin: '8px 0 0 0'
            }}>
              {metric.description}
            </p>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '24px',
        backgroundColor: darkMode ? '#334155' : '#f1f5f8',
        padding: '16px',
        borderRadius: '8px'
      }}>
        <p style={{
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '0.875rem',
          margin: '0 0 4px 0'
        }}>
          Atraso médio no trânsito
        </p>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: '0',
          color: darkMode ? '#f1f5f9' : '#1e293b'
        }}>
          {formatTrafficDelay(data.avg_traffic_delay_min)}
        </p>
      </div>
    </div>
  );
};