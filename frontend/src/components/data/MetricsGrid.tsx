import React from 'react';

interface MetricsGridProps {
  data: any;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-label">Temperature</div>
        <div className="metric-value">
          {data?.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A'}
        </div>
        <div className="metric-subtitle">Current</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-label">Humidity</div>
        <div className="metric-value">
          {data?.humidity !== undefined ? `${data.humidity}%` : 'N/A'}
        </div>
        <div className="metric-subtitle">Relative</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-label">Wind Speed</div>
        <div className="metric-value">
          {data?.wind_speed !== undefined ? `${data.wind_speed.toFixed(1)} m/s` : 'N/A'}
        </div>
        <div className="metric-subtitle">Current</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-label">QoL Score</div>
        <div className="metric-value">
          {data?.iqv_components?.overall !== undefined ? data.iqv_components.overall.toFixed(1) : 'N/A'}
        </div>
        <div className="metric-subtitle">Quality Index</div>
      </div>
    </div>
  );
};