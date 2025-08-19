interface IQVBreakdownProps {
  data: any;
  darkMode?: boolean;
}

export const IQVBreakdown = ({ data, darkMode = false }: IQVBreakdownProps) => {
  const metrics = [
    {
      name: "Temperature",
      value: data.temperature,
      unit: "°C",
      ideal: "22.5°C",
      color: data.iqv_climate >= 7 ? '#10b981' : data.iqv_climate >= 5 ? '#eab308' : '#ef4444'
    },
    {
      name: "Umidade",
      value: data.humidity,
      unit: "%",
      ideal: "50%",
      color: data.iqv_humidity >= 7 ? '#10b981' : data.iqv_humidity >= 5 ? '#eab308' : '#ef4444'
    },
    {
      name: "Trânsito",
      value: data.avg_traffic_delay_min,
      unit: "min",
      ideal: "0 min",
      color: data.iqv_traffic >= 7 ? '#10b981' : data.iqv_traffic >= 5 ? '#eab308' : '#ef4444'
    },
    {
      name: "Tendência",
      value: data.iqv_trend.toFixed(1),
      unit: "",
      ideal: "5-10",
      color: data.iqv_trend >= 7 ? '#10b981' : data.iqv_trend >= 5 ? '#eab308' : '#ef4444'
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
        Detailed QoL Analysis
      </h2>
      
      {metrics.map((metric, index) => (
        <div key={index} style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{
              color: darkMode ? '#cbd5e1' : '#1e293b',
              fontWeight: 500
            }}>
              {metric.name}
            </span>
            <span style={{
              color: metric.color,
              fontWeight: 600
            }}>
              {metric.value}{metric.unit}
            </span>
          </div>
          
          <div style={{
            height: '8px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(metric.value / 10 * 100, 100)}%`,
              backgroundColor: metric.color,
              borderRadius: '4px'
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '0.75rem',
            color: darkMode ? '#94a3b8' : '#64748b'
          }}>
            <span>Current condition</span>
            <span>Ideal condition: {metric.ideal}</span>
          </div>
        </div>
      ))}
    </div>
  );
};