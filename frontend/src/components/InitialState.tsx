export const InitialState = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    height: '50vh'
  }}>
    <div style={{ 
      fontSize: '3rem', 
      marginBottom: '16px',
      animation: 'pulse 2s infinite'
    }}>
      🌍
    </div>
    <h2 style={{ 
      fontSize: '1.5rem', 
      color: '#475569',
      marginBottom: '8px'
    }}>
      Loadind initial city
    </h2>
    <p style={{ color: '#64748b' }}>
      Fetching data for São Paulo...
    </p>
    <style>
      {`@keyframes pulse { 
        0% { opacity: 0.6; } 
        50% { opacity: 1; } 
        100% { opacity: 0.6; } 
      }`}
    </style>
  </div>
);