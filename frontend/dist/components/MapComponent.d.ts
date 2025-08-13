import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
interface MapComponentProps {
    iqvData: {
        city: string;
        iqv_overall: number;
        temperature: number;
        humidity: number;
    } | null;
}
declare const MapComponent: React.FC<MapComponentProps>;
export default MapComponent;
//# sourceMappingURL=MapComponent.d.ts.map