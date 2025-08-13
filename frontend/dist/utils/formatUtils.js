export const formatTrafficDelay = (delay) => {
    if (delay <= 0)
        return '0 minutos';
    return `${Math.round(delay)} minutos`;
};
//# sourceMappingURL=formatUtils.js.map