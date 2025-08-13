import { jsx as _jsx } from "react/jsx-runtime";
// frontend/src/components/ForecastChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
const ForecastChart = ({ data, darkMode }) => {
    if (!data || data.length === 0) {
        return (_jsx("div", { style: {
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: _jsx("p", { children: "Nenhum dado dispon\u00EDvel" }) }));
    }
    // Processa os dados para o gráfico
    const chartData = {
        labels: data.map(item => {
            const date = new Date(item.date * 1000);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
            });
        }),
        datasets: [
            {
                label: 'Temperatura Média',
                data: data.map(item => item.temperature),
                borderColor: darkMode ? '#3b82f6' : '#1d4ed8',
                backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(29, 78, 216, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: darkMode ? '#3b82f6' : '#1d4ed8',
                pointBorderColor: darkMode ? '#1e293b' : '#ffffff',
                pointBorderWidth: 2,
            },
            {
                label: 'Temperatura Mínima',
                data: data.map(item => item.minTemperature),
                borderColor: darkMode ? '#eab308' : '#fbbf24',
                backgroundColor: darkMode ? 'rgba(234, 179, 8, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: false,
                borderWidth: 1
            },
            {
                label: 'Temperatura Máxima',
                data: data.map(item => item.maxTemperature),
                borderColor: darkMode ? '#ff7f50' : '#ff5722',
                backgroundColor: darkMode ? 'rgba(255, 127, 80, 0.1)' : 'rgba(255, 87, 34, 0.1)',
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: false,
                borderWidth: 1
            }
        ]
    };
    return (_jsx("div", { style: {
            height: '300px',
            backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
            borderRadius: '8px',
            padding: '20px'
        }, children: _jsx(Line, { data: chartData, options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: darkMode ? '#cbd5e1' : '#1e293b'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        titleColor: darkMode ? '#cbd5e1' : '#1e293b',
                        bodyColor: darkMode ? '#cbd5e1' : '#1e293b',
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const datasetLabel = context.dataset.label || '';
                                if (datasetLabel === 'Temperatura Média') {
                                    return `${context.parsed.y.toFixed(1)}°C`;
                                }
                                else if (datasetLabel === 'Temperatura Mínima') {
                                    return `Min: ${context.parsed.y.toFixed(1)}°C`;
                                }
                                else if (datasetLabel === 'Temperatura Máxima') {
                                    return `Max: ${context.parsed.y.toFixed(1)}°C`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura (°C)',
                            color: darkMode ? '#cbd5e1' : '#1e293b'
                        },
                        ticks: {
                            color: darkMode ? '#94a3b8' : '#64748b',
                            callback: (value) => `${value}°C`
                        },
                        grid: {
                            color: darkMode ? 'rgba(203, 213, 225, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data',
                            color: darkMode ? '#cbd5e1' : '#1e293b'
                        },
                        ticks: {
                            color: darkMode ? '#94a3b8' : '#64748b'
                        },
                        grid: {
                            color: darkMode ? 'rgba(203, 213, 225, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            } }) }));
};
export default ForecastChart;
//# sourceMappingURL=ForecastChart.js.map