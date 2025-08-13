export const getIQVColor = (value) => {
    if (value >= 8)
        return { bg: 'bg-sky-50', text: 'text-sky-700', value: 'text-sky-600', dot: 'bg-sky-500' };
    if (value >= 6)
        return { bg: 'bg-amber-50', text: 'text-amber-700', value: 'text-amber-600', dot: 'bg-amber-500' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', value: 'text-rose-600', dot: 'bg-rose-500' };
};
export const getIQVStatus = (iqv) => {
    return iqv >= 7 ? 'Condições excelentes' :
        iqv >= 5 ? 'Condições aceitáveis' : 'Condições críticas';
};
//# sourceMappingURL=colorUtils.js.map