import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const IQVTips = ({ data, darkMode = false }) => {
    const tips = [
        {
            condition: data.iqv_climate < 5,
            title: "Clima extremo",
            description: "A temperatura está muito fora do ideal. Considere ajustar suas atividades ao ar livre.",
            icon: "🌡️"
        },
        {
            condition: data.iqv_humidity < 5,
            title: "Umidade desfavorável",
            description: "A umidade está muito alta/baixa para o conforto ideal. Mantenha-se hidratado e use roupas adequadas.",
            icon: "💧"
        },
        {
            condition: data.iqv_traffic < 5,
            title: "Trânsito intenso",
            description: "Espera-se trânsito intenso. Planeje suas viagens com antecedência e considere opções alternativas.",
            icon: "🚦"
        },
        {
            condition: data.iqv_trend < 5,
            title: "Tendência negativa",
            description: "A tendência climática está se deteriorando. Fique atento às atualizações meteorológicas.",
            icon: "📉"
        }
    ].filter(tip => tip.condition);
    return (_jsxs("div", { style: {
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginTop: '24px'
        }, children: [_jsxs("h2", { style: {
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: darkMode ? '#f1f5f9' : '#1e293b'
                }, children: ["Dicas para ", data.city] }), tips.length > 0 ? (_jsx("div", { children: tips.map((tip, index) => (_jsxs("div", { style: {
                        backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px'
                            }, children: [_jsx("span", { style: { fontSize: '1.2rem' }, children: tip.icon }), _jsx("strong", { style: {
                                        color: darkMode ? '#f1f5f9' : '#1e293b'
                                    }, children: tip.title })] }), _jsx("p", { style: {
                                margin: 0,
                                color: darkMode ? '#cbd5e1' : '#475569'
                            }, children: tip.description })] }, index))) })) : (_jsx("div", { style: {
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: darkMode ? '#334155' : '#f1f5f8',
                    borderRadius: '8px'
                }, children: _jsx("p", { style: {
                        color: darkMode ? '#cbd5e1' : '#475569',
                        margin: 0
                    }, children: "\uD83C\uDFAF Condi\u00E7\u00F5es clim\u00E1ticas ideais para atividades ao ar livre!" }) }))] }));
};
//# sourceMappingURL=IQVTips.js.map