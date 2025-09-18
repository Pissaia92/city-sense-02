export interface AqiDetails {
  us_epa_index?: number;
}

export interface QoLData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  QoL_components: {
    temperature: number;
    humidity: number;
    wind: number;
    overall: number;
    value?: number;
    summary?: string;
  };
  timestamp: string;
  latitude: number;
  longitude: number;
  weather?: { description: string };
  state?: string;
  population?: number;
  hdi?: number;
  hdi_year?: number;
  aqi?: {
    us_epa_index?: number;
  };
  uv_index?: number;
  precipitation_index?: PrecipitationIndex;
}

export interface ForecastPoint {
  datetime: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export interface PrecipitationIndex {
  value?: number;
  summary?: string;
}