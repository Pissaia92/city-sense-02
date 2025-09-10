import React from 'react';

interface ForecastPoint {
  datetime: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

interface ForecastSectionProps {
  forecast: ForecastPoint[] | null;
  mlPrediction: any;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast, mlPrediction }) => {
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get weather icon
  const getWeatherIcon = (description: string) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('rain') || desc.includes('storm') || desc.includes('chuva')) {
      return '🌧️';
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
    <div className="forecast-section">
      <h3>5-Day Forecast</h3>
      {forecast ? (
        <div className="forecast-grid">
          {forecast.slice(0, 5).map((point, index) => (
            <div key={index} className="forecast-card">
              <div className="forecast-date">{formatDate(point.datetime)}</div>
              <div className="forecast-icon">{getWeatherIcon(point.description)}</div>
              <div className="forecast-temp">{point.temperature.toFixed(1)}°C</div>
              <div className="forecast-desc">{point.description}</div>
              <div className="forecast-wind">Wind: {point.wind_speed.toFixed(1)} m/s</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading forecast data...</p>
      )}
      
      {mlPrediction && (
        <div className="ml-prediction">
          <h4>ML Prediction Trend</h4>
          <div className="prediction-info">
            <p>Next 7 days prediction available</p>
          </div>
        </div>
      )}
    </div>
  );
};