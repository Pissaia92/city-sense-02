import type { QoLData } from '../components/Types/types';

export const getQoLColor = (value: number) => {
  if (value >= 8)
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      value: 'text-sky-600',
      dot: 'bg-sky-500',
    };
  if (value >= 6)
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      value: 'text-amber-600',
      dot: 'bg-amber-500',
    };
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    value: 'text-rose-600',
    dot: 'bg-rose-500',
  };
};

export const getQoLStatus = (QoL: number) => {
  return QoL >= 7
    ? 'Condições excelentes'
    : QoL >= 5
      ? 'Condições aceitáveis'
      : 'Condições críticas';
};
