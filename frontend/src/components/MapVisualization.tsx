// frontend/src/components/MapVisualization.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CityData {
  longitude: number;
  latitude: number;
  iqv: number;
  city: string;
  country: string;
}

interface MapVisualizationProps {
  cityData: CityData | null;
  darkMode: boolean;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ cityData, darkMode }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Coordenadas padrão para quando não há dados ou são inválidas
  const defaultCoordinates: LngLatLike = [-46.633309, -23.55052]; // São Paulo
  
  // Função para validar coordenadas
  const isValidCoordinate = (coord: number | undefined): coord is number => {
    return coord !== undefined && !isNaN(coord) && isFinite(coord);
  };
  
  // Obtém coordenadas válidas
  const getValidCoordinates = (): LngLatLike => {
    if (cityData && 
        isValidCoordinate(cityData.longitude) && 
        isValidCoordinate(cityData.latitude)) {
      return [cityData.longitude, cityData.latitude];
    }
    return defaultCoordinates;
  };
  
  // Verifica se as coordenadas são válidas
  const isValidCoordinates = (coords: LngLatLike): boolean => {
    if (Array.isArray(coords)) {
      return coords.length === 2 && 
             typeof coords[0] === 'number' && 
             typeof coords[1] === 'number' &&
             isFinite(coords[0]) && 
             isFinite(coords[1]);
    } else {
      return (coords as any).lng !== undefined && 
             (coords as any).lat !== undefined &&
             typeof (coords as any).lng === 'number' &&
             typeof (coords as any).lat === 'number' &&
             isFinite((coords as any).lng) && 
             isFinite((coords as any).lat);
    }
  };
  
  useEffect(() => {
    // Configuração do estilo do mapa baseado no modo escuro
    const getMapStyle = () => {
      return 'https://tiles.stadiamaps.com/styles/outdoors.json';
    };
    
    // Inicializa o mapa
    const initializeMap = () => {
      try {
        // Evita inicializar múltiplas vezes
        if (map.current) return;
        
        // Obtém coordenadas válidas
        const coordinates = getValidCoordinates();
        
        // Valida se as coordenadas são válidas antes de criar o mapa
        if (!coordinates || !isValidCoordinates(coordinates)) {
          throw new Error('Coordenadas inválidas');
        }
        
        // Cria a instância do mapa
        map.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: getMapStyle(),
          center: coordinates as LngLatLike,
          zoom: 12,
          attributionControl: false
        });
        
        // Adiciona controles de navegação
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        
        // Adiciona uma camada de dados quando o mapa estiver carregado
        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Remove camada existente se houver
          if (map.current!.getSource('city-iqv')) {
            map.current!.removeLayer('iqv-heatmap');
            map.current!.removeSource('city-iqv');
          }
          
          // Adiciona um marcador na cidade
          if (cityData) {
            new maplibregl.Marker()
              .setLngLat([cityData.longitude, cityData.latitude])
              .setPopup(new maplibregl.Popup().setHTML(
                `<h3>${cityData.city}, ${cityData.country}</h3>
                 <p>IQV: ${cityData.iqv.toFixed(2)}</p>`
              ))
              .addTo(map.current!);
          }
          
          // Adiciona uma camada de heatmap
          if (cityData) {
            map.current!.addSource('city-iqv', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  properties: {
                    iqv: cityData.iqv
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [cityData.longitude, cityData.latitude]
                  }
                }]
              }
            });
            
            map.current!.addLayer({
              id: 'iqv-heatmap',
              type: 'heatmap',
              source: 'city-iqv',
              maxzoom: 15,
              paint: {
                'heatmap-weight': [
                  'interpolate',
                  ['linear'],
                  ['get', 'iqv'],
                  0, 0,
                  10, 1
                ],
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 1,
                  9, 3
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33,102,172,0)',
                  0.2, 'rgb(103,169,207)',
                  0.4, 'rgb(209,229,240)',
                  0.6, 'rgb(253,219,199)',
                  0.8, 'rgb(239,138,98)'
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 2,
                  9, 20
                ],
                'heatmap-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  7, 1,
                  9, 0
                ]
              }
            });
          }
        });
        
        // Tratamento de erros
        map.current.on('error', (e) => {
          setError(`Erro ao carregar o mapa: ${e.error.message}`);
          console.error('Map error:', e.error);
        });
      } catch (err) {
        setError('Falha ao inicializar o mapa. Verifique se o navegador suporta WebGL.');
        console.error('Map initialization error:', err);
      }
    };
    
    // Inicializa o mapa apenas quando o container estiver disponível
    if (mapContainer.current && !map.current) {
      initializeMap();
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [cityData, darkMode]);
  
  // Atualiza o mapa quando o modo escuro muda
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // Recarrega o estilo do mapa
    map.current.setStyle('https://tiles.stadiamaps.com/styles/outdoors.json');
  }, [darkMode, mapLoaded]);
  
  // Mostra mensagem de carregamento
  if (!cityData) {
    return (
      <div style={{
        height: '400px',
        backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: '10px',
            color: darkMode ? '#cbd5e1' : '#475569'
          }}>
            🌍
          </div>
          <h3 style={{ 
            color: darkMode ? '#cbd5e1' : '#475569',
            marginBottom: '8px'
          }}>
            Mapa da Cidade
          </h3>
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            Selecione uma cidade para visualizar no mapa
          </p>
        </div>
      </div>
    );
  }
  
  // Mostra erro se houver
  if (error) {
    return (
      <div style={{
        height: '400px',
        backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
        border: `1px solid ${darkMode ? '#dc2626' : '#dc2626'}`
      }}>
        <div style={{ 
          color: darkMode ? '#fca5a5' : '#dc2626',
          textAlign: 'center'
        }}>
          <h3>Erro no Mapa</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      height: '400px',
      borderRadius: '8px',
      overflow: 'hidden',
      margin: '20px 0',
      boxShadow: darkMode 
        ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%' 
        }} 
      />
      {/* Legenda do heatmap */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        border: darkMode ? '1px solid #729fddff' : '1px solid #e2e8f0'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Legenda do IQV
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              backgroundColor: 'rgb(33,102,172)', 
              marginRight: '8px',
              borderRadius: '4px'
            }}></span>
            Alto (8-10)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'rgb(103,169,207)', 
              marginRight: '8px',
              borderRadius: '4px'
            }}></span>
            Bom (6-8)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'rgb(209,229,240)', 
              marginRight: '8px',
              borderRadius: '4px'
            }}></span>
            Médio (4-6)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'rgb(253,219,199)', 
              marginRight: '8px',
              borderRadius: '4px'
            }}></span>
            Baixo (2-4)
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'rgb(239,138,98)', 
              marginRight: '8px',
              borderRadius: '4px'
            }}></span>
            Muito Baixo (0-2)
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;