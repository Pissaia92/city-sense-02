import React from 'react';

interface HeaderProps {
  data: any;
  city: string;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const Header = ({ data, city, darkMode = false, toggleDarkMode }: HeaderProps) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      marginBottom: '24px',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
    }}>
      <div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: 0,
          color: darkMode ? '#f1f5f9' : '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🌆 City Sense
        </h1>
        <p style={{
          color: darkMode ? '#94a3b8' : '#64748b',
          marginTop: '4px',
          fontSize: '1.1rem'
        }}>
          Índice de Qualidade de Vida Urbana
        </p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ 
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '0.9rem'
        }}>
          Modo de cores
        </span>
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'none',
            border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: darkMode ? '#cbd5e1' : '#475569',
            transition: 'all 0.3s ease'
          }}
          title={darkMode ? "Modo claro" : "Modo escuro"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};