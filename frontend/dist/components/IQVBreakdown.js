import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const IQVBreakdown = ({ data, darkMode = false }) => {
    const metrics = [
        {
            name: "Temperatura",
            value: data.temperature,
            unit: "°C",
            ideal: "22.5°C",
            color: data.iqv_climate >= 7 ? '#10b981' : data.iqv_climate >= 5 ? '#eab308' : '#ef4444'
        },
        {
            name: "Umidade",
            value: data.humidity,
            unit: "%",
            ideal: "50%",
            color: data.iqv_humidity >= 7 ? '#10b981' : data.iqv_humidity >= 5 ? '#eab308' : '#ef4444'
        },
        {
            name: "Trânsito",
            value: data.avg_traffic_delay_min,
            unit: "min",
            ideal: "0 min",
            color: data.iqv_traffic >= 7 ? '#10b981' : data.iqv_traffic >= 5 ? '#eab308' : '#ef4444'
        },
        {
            name: "Tendência",
            value: data.iqv_trend.toFixed(1),
            unit: "",
            ideal: "5-10",
            color: data.iqv_trend >= 7 ? '#10b981' : data.iqv_trend >= 5 ? '#eab308' : '#ef4444'
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
                }, children: "An\u00E1lise Detalhada do IQV" }), metrics.map((metric, index) => (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                        }, children: [_jsx("span", { style: {
                                    color: darkMode ? '#cbd5e1' : '#1e293b',
                                    fontWeight: 500
                                }, children: metric.name }), _jsxs("span", { style: {
                                    color: metric.color,
                                    fontWeight: 600
                                }, children: [metric.value, metric.unit] })] }), _jsx("div", { style: {
                            height: '8px',
                            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }, children: _jsx("div", { style: {
                                height: '100%',
                                width: `${Math.min(metric.value / 10 * 100, 100)}%`,
                                backgroundColor: metric.color,
                                borderRadius: '4px'
                            } }) }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '4px',
                            fontSize: '0.75rem',
                            color: darkMode ? '#94a3b8' : '#64748b'
                        }, children: [_jsx("span", { children: "Condi\u00E7\u00E3o atual" }), _jsxs("span", { children: ["Condi\u00E7\u00E3o ideal: ", metric.ideal] })] })] }, index)))] }));
};
//# sourceMappingURL=IQVBreakdown.js.map