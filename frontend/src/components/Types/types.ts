export interface ForecastPoint {
  date: string;
  temperature: number;
  description: string;
  minTemperature: number;
  maxTemperature: number;
  icon: string;
}
export interface IQVData {
  id: string;
  value: number;
  status: string;
  }