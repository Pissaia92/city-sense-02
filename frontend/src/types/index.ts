export interface IQVData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  iqv_components: {
    temperature: number;
    humidity: number;
    wind: number;
    overall: number;
  };
  timestamp: string;
  latitude: number;
  longitude: number;
  weather?: { description: string };
}

export interface ForecastPoint {
  datetime: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}