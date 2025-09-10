import React from 'react';

interface IQVBreakdownProps {
  data: any;
}

export const IQVBreakdown: React.FC<IQVBreakdownProps> = ({ data }) => {
  const components = data?.iqv_components;
  
  if (!components) {
    return (
      <div className="iqv-breakdown">
        <h3>QoL Breakdown</h3>
        <p>Loading components...</p>
      </div>
    );
  }

  return (
    <div className="iqv-breakdown">
      <h3>IQV Breakdown</h3>
      <div className="iqv-components">
        <div className="component-card">
          <div className="component-label">Temperature</div>
          <div className="component-value">{components.temperature?.toFixed(1) || '0.0'}</div>
          <div className="component-description">Comfort level</div>
        </div>
        
        <div className="component-card">
          <div className="component-label">Humidity</div>
          <div className="component-value">{components.humidity?.toFixed(1) || '0.0'}</div>
          <div className="component-description">Moisture level</div>
        </div>
        
        <div className="component-card">
          <div className="component-label">Wind</div>
          <div className="component-value">{components.wind?.toFixed(1) || '0.0'}</div>
          <div className="component-description">Air movement</div>
        </div>
        
        <div className="component-card">
          <div className="component-label">Overall</div>
          <div className="component-value">{components.overall?.toFixed(1) || '0.0'}</div>
          <div className="component-description">Composite score</div>
        </div>
      </div>
    </div>
  );
};