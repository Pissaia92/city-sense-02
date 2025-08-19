import React from 'react';

interface IQVTipsProps {
  data: any;
  darkMode?: boolean;
}

export const IQVTips = ({ data, darkMode = false }: IQVTipsProps) => {
  const tips = [
    {
      condition: data.iqv_climate < 5,
      title: "Extreme Forecast",
      description: "The temperature is distant from ideal. Consider adjusting your outdoor activities.",
      icon: "🌡️"
    },
    {
      condition: data.iqv_humidity < 5,
      title: "Unfavorable Humidity",
      description: "Humidity is too high/low for ideal comfort. Stay hydrated and wear appropriate clothing.",
      icon: "💧"
    },
    {
      condition: data.iqv_traffic < 5,
      title: "Heavy Traffic",
      description: "Heavy traffic is expected. Plan your trips in advance and consider alternative options.",
      icon: "🚦"
    },
    {
      condition: data.iqv_trend < 5,
      title: "Negative Trend",
      description: "The climate trend is deteriorating. Stay tuned for weather updates.",
      icon: "📉"
    }
  ].filter(tip => tip.condition);

  return (
    <div style={{
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginTop: '24px'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: darkMode ? '#f1f5f9' : '#1e293b'
      }}>
        Tips for {data.city}
      </h2>
      
      {tips.length > 0 ? (
        <div>
          {tips.map((tip, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{tip.icon}</span>
                <strong style={{
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}>
                  {tip.title}
                </strong>
              </div>
              <p style={{
                margin: 0,
                color: darkMode ? '#cbd5e1' : '#475569'
              }}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: darkMode ? '#334155' : '#f1f5f8',
          borderRadius: '8px'
        }}>
          <p style={{
            color: darkMode ? '#cbd5e1' : '#475569',
            margin: 0
          }}>
            🎯 Ideal weather conditions for outdoor activities!
          </p>
        </div>
      )}
    </div>
  );
};