import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const Footer = ({ darkMode = false }) => {
    return (_jsxs("footer", { style: {
            textAlign: 'center',
            paddingTop: '24px',
            marginTop: '24px',
            borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '0.875rem'
        }, children: [_jsxs("p", { style: { margin: '8px 0' }, children: ["City Sense \u00A9 ", new Date().getFullYear(), " - Todos os direitos reservados"] }), _jsx("p", { style: { margin: '8px 0' }, children: "Dados clim\u00E1ticos fornecidos por OpenWeatherMap" })] }));
};
//# sourceMappingURL=Footer.js.map