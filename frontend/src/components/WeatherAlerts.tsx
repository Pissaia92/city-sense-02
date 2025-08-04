export const WeatherAlerts = ({ alerts }: { alerts: any[] }) => {
  if (!alerts || alerts.length === 0) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      {alerts.map((alert, index) => (
        <div 
          key={index}
          style={{
            backgroundColor: alert.severity === 'high' ? '#fee2e2' : '#ffedd5',
            borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {alert.message}
          </div>
        </div>
      ))}
    </div>
  );
};