import React from 'react';

interface CityMapProps {
  data: any;
}

export const CityMap: React.FC<CityMapProps> = ({ data }) => {
  
  return (
    <div className="map-section">
      <h3>City Location</h3>
      <div className="map-container">
        {data ? (
          <div className="map-placeholder">
            <div className="map-coordinates">
              <p>Latitude: {data.latitude?.toFixed(4) || '0.0000'}</p>
              <p>Longitude: {data.longitude?.toFixed(4) || '0.0000'}</p>
            </div>
            <div className="map-marker">
              📍
            </div>
            <div className="map-info">
              <p>{data.city || 'City'}, {data.country || 'Country'}</p>
            </div>
          </div>
        ) : (
          <div className="map-loading">
            <p>Loading map...</p>
          </div>
        )}
      </div>
    </div>
  );
};