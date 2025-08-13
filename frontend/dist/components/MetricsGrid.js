import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const MetricsGrid = ({ data, formatTrafficDelay, darkMode = false }) => {
    const metrics = [
        {
            title: "IQV Geral",
            value: data.iqv_overall,
            description: "Índice geral de qualidade de vida",
            color: data.iqv_overall >= 7 ? '#10b981' : data.iqv_overall >= 5 ? '#eab308' : '#ef4444'
        },
        {
            title: "IQV Clima",
            value: data.iqv_climate,
            description: "Qualidade do clima local",
            color: data.iqv_climate >= 7 ? '#10b981' : data.iqv_climate >= 5 ? '#eab308' : '#ef4444'
        },
        {
            title: "IQV Umidade",
            value: data.iqv_humidity,
            description: "Nível de conforto da umidade",
            color: data.iqv_humidity >= 7 ? '#10b981' : data.iqv_humidity >= 5 ? '#eab308' : '#ef4444'
        },
        {
            title: "IQV Trânsito",
            value: data.iqv_traffic,
            description: "Qualidade do trânsito",
            color: data.iqv_traffic >= 7 ? '#10b981' : data.iqv_traffic >= 5 ? '#eab308' : '#ef4444'
        }
    ];
    return (_jsxs("div", { style: {
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
        }, children: [_jsx("h2", { style: {
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '20px',
                    color: darkMode ? '#f1f5f9' : '#1e293b'
                }, children: "M\u00E9tricas Detalhadas" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }, children: metrics.map((metric, index) => (_jsxs("div", { style: {
                        backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                        padding: '16px',
                        borderRadius: '8px',
                        transition: 'transform 0.2s ease'
                    }, onMouseOver: e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }, onMouseOut: e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }, children: [_jsx("p", { style: {
                                color: darkMode ? '#94a3b8' : '#64748b',
                                fontSize: '0.875rem',
                                margin: '0 0 4px 0'
                            }, children: metric.title }), _jsxs("p", { style: {
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                margin: '0',
                                color: metric.color
                            }, children: [metric.value.toFixed(1), "/10"] }), _jsx("p", { style: {
                                color: darkMode ? '#cbd5e1' : '#475569',
                                fontSize: '0.875rem',
                                margin: '8px 0 0 0'
                            }, children: metric.description })] }, index))) }), _jsxs("div", { style: {
                    marginTop: '24px',
                    backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                    padding: '16px',
                    borderRadius: '8px'
                }, children: [_jsx("p", { style: {
                            color: darkMode ? '#94a3b8' : '#64748b',
                            fontSize: '0.875rem',
                            margin: '0 0 4px 0'
                        }, children: "Atraso m\u00E9dio no tr\u00E2nsito" }), _jsx("p", { style: {
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            margin: '0',
                            color: darkMode ? '#f1f5f9' : '#1e293b'
                        }, children: formatTrafficDelay(data.avg_traffic_delay_min) })] })] }));
};
//# sourceMappingURL=MetricsGrid.js.map