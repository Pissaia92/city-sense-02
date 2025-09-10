import React from 'react';

interface CityHeaderProps {
  data: any;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ data }) => {
  // Helper function to get weather icon based on description
  const getWeatherIcon = (description: string) => {
    // Verificar se description existe antes de chamar toLowerCase
    if (!description) return '🌤️';
    
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return '⛈️';
    }
    if (desc.includes('cloud') || desc.includes('nublado')) {
      return '☁️';
    }
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('sol')) {
      return '☀️';
    }
    if (desc.includes('snow') || desc.includes('neve')) {
      return '❄️';
    }
    return '🌤️';
  };

  return (
    <div className="city-header">
      <div className="weather-summary">
        <div className="weather-icon">
          {getWeatherIcon(data?.weather?.description || data?.description || '')}
        </div>
        <div className="temperature">
          {data?.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A'}
        </div>
        <div className="weather-description">
          {data?.weather?.description || data?.description || 'Loading...'}
        </div>
      </div>
      
      <div className="location-info">
        <h2>{data?.city || 'Loading City'}, {data?.country || 'Loading Country'}</h2>
        <p>Coordinates: {data?.latitude?.toFixed(4) || '0'}, {data?.longitude?.toFixed(4) || '0'}</p>
      </div>
    </div>
  );
};