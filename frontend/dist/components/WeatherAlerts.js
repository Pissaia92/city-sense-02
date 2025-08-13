import { jsx as _jsx } from "react/jsx-runtime";
export const WeatherAlerts = ({ alerts }) => {
    if (!alerts || alerts.length === 0)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '400px'
        }, children: alerts.map((alert, index) => (_jsx("div", { style: {
                backgroundColor: alert.severity === 'high' ? '#fee2e2' : '#ffedd5',
                borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }, children: _jsx("div", { style: { fontWeight: 600, marginBottom: '4px' }, children: alert.message }) }, index))) }));
};
//# sourceMappingURL=WeatherAlerts.js.map