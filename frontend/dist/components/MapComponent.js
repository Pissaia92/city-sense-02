import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
const getIQVColor = (value) => {
    if (value >= 8)
        return '#10B981';
    if (value >= 6)
        return '#F59E0B';
    return '#EF4444';
};
const MapComponent = ({ iqvData }) => {
    useEffect(() => {
        if (!iqvData)
            return;
        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.stadiamaps.com/styles/outdoors.json',
            center: [-46.6333, -23.5505],
            zoom: 11
        });
        new maplibregl.Marker()
            .setLngLat([-46.6333, -23.5505])
            .setPopup(new maplibregl.Popup().setHTML(`
          <div style="width:200px">
            <h3>${iqvData.city}</h3>
            <p>IQV Geral: <strong style="color:${getIQVColor(iqvData.iqv_overall)}">${iqvData.iqv_overall.toFixed(2)}</strong></p>
            <p>Temperatura: ${iqvData.temperature.toFixed(1)}°C</p>
            <p>Umidade: ${iqvData.humidity}%</p>
          </div>
        `))
            .addTo(map);
        return () => map.remove();
    }, [iqvData]);
    return (_jsxs("div", { style: {
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '20px'
        }, children: [_jsx("h2", { children: "\uD83D\uDCCD Mapa de Qualidade de Vida" }), _jsx("div", { id: "map", style: { width: '100%', height: '400px', borderRadius: '8px' } })] }));
};
export default MapComponent;
//# sourceMappingURL=MapComponent.js.map