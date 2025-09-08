import React from 'react';

interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
  color?: string;
}

interface MetricsGridProps {
  metrics: Metric[];
  darkMode?: boolean;
}

export const MetricsGrid = ({ metrics, darkMode = false }: MetricsGridProps) => {
  const getColorForValue = (value: number | string): string => {
    if (typeof value === 'string') return darkMode ? '#f1f5f9' : '#1e293b';
    if (value >= 7) return '#10b981';
    if (value >= 5) return '#eab308';
    return '#ef4444';
  };

  return (
    <div style={{
      backgroundColor: darkMode ? 'var(--background-secondary)' : 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: darkMode ? 'var(--foreground)' : '#1e293b'
      }}>
        Detailed Metrics
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {metrics.map((metric) => (
          <div 
            key={metric.name}
            style={{
              backgroundColor: darkMode ? 'var(--background)' : '#f1f5f8',
              padding: '16px',
              borderRadius: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p style={{
              color: darkMode ? 'var(--foreground-secondary)' : '#64748b',
              fontSize: '0.875rem',
              margin: '0 0 4px 0'
            }}>
              {metric.name}
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0',
              color: metric.color || getColorForValue(metric.value)
            }}>
              {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
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
    </div>
  );
};