// frontend/src/components/MapVisualization.tsx
import React, { useEffect, useRef } from 'react';

interface CityData {
  longitude: number;
  latitude: number;
  iqv: number;
}

interface MapVisualizationProps {
  cityData: CityData | null;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ cityData }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cityData || !mapContainer.current) return;

    // Implementação simplificada do mapa
    console.log('Mapa carregado com:', cityData);
    
    // Aqui você implementaria o MapLibre GL
    // Exemplo:
    // const map = new maplibregl.Map({
    //   container: mapContainer.current,
    //   style: 'mapbox://styles/mapbox/streets-v11',
    //   center: [cityData.longitude, cityData.latitude],
    //   zoom: 10
    // });
  }, [cityData]);

  return (
    <div 
      ref={mapContainer} 
      style={{
        height: '400px',
        backgroundColor: '#e2e8f0',
        borderRadius: '8px',
        margin: '20px 0'
      }}
    >
      {cityData ? (
        <div>
          <h3>Mapa da Cidade</h3>
          <p>IQV: {cityData.iqv}</p>
        </div>
      ) : (
        <div>
          <h3>Nenhum dado para exibir</h3>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;