import type { QoLData } from '../components/Types/types';

export const getWeatherIcon = (data?: QoLData) => {
  if (!data) return '🌤️';
  const desc = data.description.toLowerCase();
  if (desc.includes('chuva') || desc.includes('storm')) return '⛈️';
  if (desc.includes('nublado') || desc.includes('cloud')) return '☁️';
  if (desc.includes('sol') || desc.includes('clear')) return '☀️';
  if (desc.includes('neve')) return '❄️';
  return '🌤️';
};

export const getTrendIndicator = (data?: QoLData) => {
  if (!data) return { icon: '→', color: 'text-gray-500' };
  const trend = data.QoL_trend;
  if (trend > 5.5) return { icon: '↑', color: 'text-emerald-500' };
  if (trend < 4.5) return { icon: '↓', color: 'text-rose-500' };
  return { icon: '→', color: 'text-amber-500' };
};
