// Declara o tipo de retorno da função fetchIQVData
interface IQVData {
  city: string;
  temperature: number;
  humidity: number;
  traffic_delay: number;
  aqi: number;
  safety_index: number;
  temp_normalized: number;
  humidity_score: number;
  traffic_score: number;
  predicted_iqv: number;
  timestamp: string; // ISO string
}

export function fetchIQVData(city: string): Promise<IQVData>;