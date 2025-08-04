export const formatTrafficDelay = (delay: number) => {
  if (delay <= 0) return '0 minutos';
  return `${Math.round(delay)} minutos`;
};