// frontend/src/types.ts
export interface ForecastPoint {
  date: string;
  temp: number;
  condition: string;
}
export interface IQVData {
  iqv_trend: any;
  value: number;
  description: string;
  timestamp: string;
}
