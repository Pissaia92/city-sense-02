import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ForecastPoint } from './Types/types';

interface MapComponentProps {
  QoLData: {
    city: string;
    QoL_overall: number;
    temperature: number;
    humidity: number;
  } | null;
}

const getQoLColor = (value: number) => {
  if (value >= 8) return '#10B981';
  if (value >= 6) return '#F59E0B';
  return '#EF4444';
};

const MapComponent: React.FC<MapComponentProps> = ({ QoLData }) => {
  useEffect(() => {
    if (!QoLData) return;

    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/outdoors.json',
      center: [-46.6333, -23.5505],
      zoom: 11,
    });

    new maplibregl.Marker()
      .setLngLat([-46.6333, -23.5505])
      .setPopup(
        new maplibregl.Popup().setHTML(`
          <div style="width:200px">
            <h3>${QoLData.city}</h3>
            <p>QoL Geral: <strong style="color:${getQoLColor(QoLData.QoL_overall)}">${QoLData.QoL_overall.toFixed(2)}</strong></p>
            <p>Temperatura: ${QoLData.temperature.toFixed(1)}°C</p>
            <p>Umidade: ${QoLData.humidity}%</p>
          </div>
        `)
      )
      .addTo(map);

    return () => map.remove();
  }, [QoLData]);

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '20px',
      }}
    >
      <h2>📍 Mapa de Qualidade de Vida</h2>
      <div
        id="map"
        style={{ width: '100%', height: '400px', borderRadius: '8px' }}
      />
    </div>
  );
};

export default MapComponent;
