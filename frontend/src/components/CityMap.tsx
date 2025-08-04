// src/components/CityMap.tsx
import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapType } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CityMapProps {
  city: string;
  temperature: number;
  iqv: number;
}

export const CityMap = ({ city, temperature, iqv }: CityMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapType | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Configuração inicial do mapa
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_D6rA4zTHduk6KOKm6K9g',
      center: [-46.633309, -23.55052], // São Paulo por padrão
      zoom: 10
    });
    
    // Adiciona controles de navegação
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Quando o componente for desmontado
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (!map.current || !city) return;
    
    // Busca coordenadas da cidade
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const [lon, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
          
          // Atualiza a visão do mapa
          if (map.current) {
            map.current.setCenter([lon, lat]);
            map.current.setZoom(12);
            
            // Remove marcadores anteriores
            if (map.current.getLayer('city-marker')) {
              map.current.removeLayer('city-marker');
              map.current.removeSource('city-marker');
            }
            
            // Adiciona novo marcador
            map.current.addSource('city-marker', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [lon, lat]
                }
              }
            });
            
            map.current.addLayer({
              id: 'city-marker',
              type: 'circle',
              source: 'city-marker',
              paint: {
                'circle-radius': 10,
                'circle-color': iqv >= 7 ? '#22c55e' : iqv >= 5 ? '#eab308' : '#ef4444',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }
            });
            
            // Adiciona popup com informações
            new maplibregl.Popup({ offset: 25 })
              .setLngLat([lon, lat])
              .setHTML(`
                <div style="font-family: sans-serif;">
                  <h3 style="margin: 0 0 8px 0;">${city}</h3>
                  <div>🌡️ Temperatura: ${temperature}°C</div>
                  <div>📊 IQV: ${iqv.toFixed(1)}/10</div>
                </div>
              `)
              .addTo(map.current);
          }
        }
      })
      .catch(error => {
        console.error('Erro ao buscar coordenadas:', error);
      });
  }, [city, temperature, iqv]);
  
  return (
    <div style={{ 
      height: '400px', 
      borderRadius: '12px', 
      overflow: 'hidden',
      marginTop: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem'
      }}>
        Dados climáticos integrados ao mapa
      </div>
    </div>
  );
};