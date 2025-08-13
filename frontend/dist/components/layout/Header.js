import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Header = ({ data, city, darkMode = false, toggleDarkMode }) => {
    return (_jsxs("header", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            marginBottom: '24px',
            borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            margin: 0,
                            color: darkMode ? '#f1f5f9' : '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }, children: "\uD83C\uDF06 City Sense" }), _jsx("p", { style: {
                            color: darkMode ? '#94a3b8' : '#64748b',
                            marginTop: '4px',
                            fontSize: '1.1rem'
                        }, children: "\u00CDndice de Qualidade de Vida Urbana" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { style: {
                            color: darkMode ? '#94a3b8' : '#64748b',
                            fontSize: '0.9rem'
                        }, children: "Modo de cores" }), _jsx("button", { onClick: toggleDarkMode, style: {
                            background: 'none',
                            border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: darkMode ? '#cbd5e1' : '#475569',
                            transition: 'all 0.3s ease'
                        }, title: darkMode ? "Modo claro" : "Modo escuro", children: darkMode ? '☀️' : '🌙' })] })] }));
};
//# sourceMappingURL=Header.js.map