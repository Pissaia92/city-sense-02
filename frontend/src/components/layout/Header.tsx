import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

interface HeaderProps {
  data: any;
  city: string;
}

export const Header: React.FC<HeaderProps> = ({ data, city }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🌍 City Sense</h1>
        <div className="header-controls">
          <button 
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      {data && (
        <div className="city-info">
          <h2>{data.city}, {data.country}</h2>
          <p>Atualizado em: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      )}
    </header>
  );
};