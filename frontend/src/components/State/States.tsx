import React from 'react';

interface LoadingStateProps {
  darkMode?: boolean;
}

export const LoadingState = ({ darkMode = false }: LoadingStateProps) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    backgroundColor: darkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: `5px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      borderTop: `5px solid ${darkMode ? '#94a3b8' : '#3b82f6'}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }} />
    <h3 style={{
      color: darkMode ? '#cbd5e1' : '#1e293b',
      margin: 0
    }}>
      Carregando dados...
    </h3>
    
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  darkMode?: boolean;
}

export const ErrorState = ({ error, onRetry, darkMode = false }: ErrorStateProps) => (
  <div style={{
    backgroundColor: darkMode ? '#b91c1c' : '#fee2e2',
    borderLeft: '4px solid',
    borderLeftColor: darkMode ? '#f87171' : '#ef4444',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div>
        <h3 style={{
          color: darkMode ? '#fca5a5' : '#b91c1c',
          marginTop: 0,
          marginBottom: '8px'
        }}>
          ⚠️ Erro ao carregar dados
        </h3>
        <p style={{
          color: darkMode ? '#fca5a5' : '#b91c1c',
          margin: 0
        }}>
          {error}
        </p>
      </div>
      <button
        onClick={onRetry}
        style={{
          background: 'none',
          border: `1px solid ${darkMode ? '#fca5a5' : '#b91c1c'}`,
          color: darkMode ? '#fca5a5' : '#b91c1c',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          marginLeft: '16px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = darkMode ? '#dc2626' : '#fecaca';
          e.currentTarget.style.color = darkMode ? '#f8fafc' : '#991b1b';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = darkMode ? '#fca5a5' : '#b91c1c';
        }}
      >
        Tentar novamente
      </button>
    </div>
  </div>
);