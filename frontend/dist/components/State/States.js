import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const LoadingState = ({ darkMode = false }) => (_jsxs("div", { style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        backgroundColor: darkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
    }, children: [_jsx("div", { style: {
                width: '60px',
                height: '60px',
                border: `5px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderTop: `5px solid ${darkMode ? '#94a3b8' : '#3b82f6'}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            } }), _jsx("h3", { style: {
                color: darkMode ? '#cbd5e1' : '#1e293b',
                margin: 0
            }, children: "Carregando dados..." }), _jsx("style", { children: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
export const ErrorState = ({ error, onRetry, darkMode = false }) => (_jsx("div", { style: {
        backgroundColor: darkMode ? '#b91c1c' : '#fee2e2',
        borderLeft: '4px solid',
        borderLeftColor: darkMode ? '#f87171' : '#ef4444',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px'
    }, children: _jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }, children: [_jsxs("div", { children: [_jsx("h3", { style: {
                            color: darkMode ? '#fca5a5' : '#b91c1c',
                            marginTop: 0,
                            marginBottom: '8px'
                        }, children: "\u26A0\uFE0F Erro ao carregar dados" }), _jsx("p", { style: {
                            color: darkMode ? '#fca5a5' : '#b91c1c',
                            margin: 0
                        }, children: error })] }), _jsx("button", { onClick: onRetry, style: {
                    background: 'none',
                    border: `1px solid ${darkMode ? '#fca5a5' : '#b91c1c'}`,
                    color: darkMode ? '#fca5a5' : '#b91c1c',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    marginLeft: '16px',
                    transition: 'all 0.2s ease'
                }, onMouseOver: (e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#dc2626' : '#fecaca';
                    e.currentTarget.style.color = darkMode ? '#f8fafc' : '#991b1b';
                }, onMouseOut: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = darkMode ? '#fca5a5' : '#b91c1c';
                }, children: "Tentar novamente" })] }) }));
//# sourceMappingURL=States.js.map