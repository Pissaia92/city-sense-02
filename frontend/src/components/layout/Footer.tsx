import React from 'react';

interface FooterProps {
  darkMode?: boolean;
}

export const Footer = ({ darkMode = false }: FooterProps) => {
  return (
    <footer style={{
      textAlign: 'center',
      paddingTop: '24px',
      marginTop: '24px',
      borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '0.875rem'
    }}>
      <p style={{ margin: '8px 0' }}>
        City Sense © {new Date().getFullYear()} - Todos os direitos reservados
      </p>
      <p style={{ margin: '8px 0' }}>
        Dados climáticos fornecidos por OpenWeatherMap
      </p>
    </footer>
  );
};