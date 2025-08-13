import React from 'react';
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
export declare const MapVisualization: React.FC<MapVisualizationProps>;
export default MapVisualization;
//# sourceMappingURL=MapVisualization.d.ts.map