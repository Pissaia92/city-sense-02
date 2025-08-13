import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { DateTime } from 'luxon';
export const CityHeader = ({ data, dataFormatada, getWeatherIcon, darkMode = false }) => {
    return (_jsxs("div", { style: {
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginBottom: '24px'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                }, children: [_jsx("div", { children: _jsxs("h2", { style: {
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                margin: '0 0 8px 0',
                                color: darkMode ? '#f1f5f9' : '#0f172a'
                            }, children: [data.city, ", ", data.country] }) }), _jsx("div", { style: {
                            fontSize: '3.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }, children: getWeatherIcon() })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginTop: '16px'
                }, children: [_jsxs("div", { style: {
                            backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                            padding: '16px',
                            borderRadius: '8px'
                        }, children: [_jsx("p", { style: {
                                    color: darkMode ? '#94a3b8' : '#64748b',
                                    fontSize: '0.875rem',
                                    margin: '0 0 4px 0'
                                }, children: "Temperatura" }), _jsxs("p", { style: {
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    margin: 0,
                                    color: darkMode ? '#f1f5f9' : '#0f172a'
                                }, children: [data.temperature, "\u00B0C"] })] }), _jsxs("div", { style: {
                            backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                            padding: '16px',
                            borderRadius: '8px'
                        }, children: [_jsx("p", { style: {
                                    color: darkMode ? '#94a3b8' : '#64748b',
                                    fontSize: '0.875rem',
                                    margin: '0 0 4px 0'
                                }, children: "Umidade" }), _jsxs("p", { style: {
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    margin: 0,
                                    color: darkMode ? '#f1f5f9' : '#0f172a'
                                }, children: [data.humidity, "%"] })] })] })] }));
};
//# sourceMappingURL=CityHeader.js.map