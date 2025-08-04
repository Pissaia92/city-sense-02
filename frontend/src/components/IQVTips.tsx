import React from 'react';

interface IQVTipsProps {
  data: any;
  darkMode?: boolean;
}

export const IQVTips = ({ data, darkMode = false }: IQVTipsProps) => {
  const tips = [
    {
      condition: data.iqv_climate < 5,
      title: "Clima extremo",
      description: "A temperatura está muito fora do ideal. Considere ajustar suas atividades ao ar livre.",
      icon: "🌡️"
    },
    {
      condition: data.iqv_humidity < 5,
      title: "Umidade desfavorável",
      description: "A umidade está muito alta/baixa para o conforto ideal. Mantenha-se hidratado e use roupas adequadas.",
      icon: "💧"
    },
    {
      condition: data.iqv_traffic < 5,
      title: "Trânsito intenso",
      description: "Espera-se trânsito intenso. Planeje suas viagens com antecedência e considere opções alternativas.",
      icon: "🚦"
    },
    {
      condition: data.iqv_trend < 5,
      title: "Tendência negativa",
      description: "A tendência climática está se deteriorando. Fique atento às atualizações meteorológicas.",
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
        Dicas para {data.city}
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
            🎯 Condições climáticas ideais para atividades ao ar livre!
          </p>
        </div>
      )}
    </div>
  );
};