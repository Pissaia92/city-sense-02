# backend/consolidate_parquet_data.py
import polars as pl
from pathlib import Path
import logging
from datetime import datetime
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def consolidate_parquet_data(weather_parquet_path: Path, traffic_parquet_path: Path, output_path: Path):
    try:
        logger.info("Iniciando consolidação de dados Parquet...")
        
        if not weather_parquet_path.exists():
            logger.error(f"❌ Arquivo de clima não encontrado: {weather_parquet_path}")
            return
        if not traffic_parquet_path.exists():
            logger.error(f"❌ Arquivo de trânsito não encontrado: {traffic_parquet_path}")
            return
            
        df_weather = pl.read_parquet(weather_parquet_path)
        df_traffic = pl.read_parquet(traffic_parquet_path)
        
        logger.info(f"✅ Dados de clima carregados: {df_weather.height} linhas")
        logger.info(f"✅ Dados de trânsito carregados: {df_traffic.height} linhas")
        
        if df_weather.is_empty() or df_traffic.is_empty():
            logger.error("❌ Um ou ambos os DataFrames estão vazios.")
            return

        latest_weather = df_weather.tail(1)
        avg_temperature = latest_weather['temperature'][0]
        avg_humidity = latest_weather['humidity'][0]
        timestamp_str = latest_weather['timestamp'][0]
        
        try:
            dt_obj = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except ValueError:
            try:
                dt_obj = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                logger.warning(f"⚠️ Não foi possível parsear o timestamp '{timestamp_str}'. Usando data atual.")
                dt_obj = datetime.now()
                
        day_of_week = dt_obj.weekday()
        month = dt_obj.month
        
        avg_traffic_delay = df_traffic['delay'].mean()
        if avg_traffic_delay is None:
            avg_traffic_delay = 0.0
        avg_traffic_delay_minutes = avg_traffic_delay / 60.0
        
        # Gera target (iqv_overall) sintético
        iqv_overall = (
            80  
            - 0.5 * abs(avg_temperature - 22)  
            - 0.2 * abs(avg_humidity - 50)    
            - 0.8 * avg_traffic_delay_minutes 
            + (10 if 6 <= month <= 8 else 0)  
        )
        iqv_overall = max(0, min(100, iqv_overall)) 
        
        # Cria DataFrame base
        consolidated_data = pl.DataFrame([{
            "temperature": avg_temperature,
            "humidity": avg_humidity,
            "traffic_delay": avg_traffic_delay_minutes,
            "day_of_week": day_of_week,
            "month": month,
            "iqv_overall": iqv_overall
        }])
        
        # Gera variações para múltiplas amostras
        np.random.seed(42)
        n_samples = 100
        variations = []
        for i in range(n_samples):
            temp_var = np.random.normal(0, 1)
            humidity_var = np.random.normal(0, 2)
            traffic_var = np.random.normal(0, 2)
            
            temp = max(-10, min(50, avg_temperature + temp_var))
            humidity = max(0, min(100, avg_humidity + humidity_var))
            traffic = max(0, avg_traffic_delay_minutes + traffic_var)
            
            iqv = (
                80
                - 0.5 * abs(temp - 22)
                - 0.2 * abs(humidity - 50)
                - 0.8 * traffic
                + (10 if 6 <= month <= 8 else 0)
            )
            iqv = max(0, min(100, iqv))
            
            variations.append({
                "temperature": temp,
                "humidity": humidity,
                "traffic_delay": traffic,
                "day_of_week": day_of_week,
                "month": month,
                "iqv_overall": iqv
            })
            
        consolidated_df = pl.DataFrame(variations)
        
        # Salva arquivo
        consolidated_df.write_parquet(output_path)
        logger.info(f"✅ Dados consolidados salvos em: {output_path}")
        logger.info(f"📊 Número de amostras geradas: {consolidated_df.height}")
        print(consolidated_df.head())
        
    except Exception as e:
        logger.error(f"❌ Erro na consolidação de dados Parquet: {e}")
        raise

def main():
    data_dir = Path(__file__).parent / "data"
    weather_file = data_dir / "weather_data.parquet"
    traffic_file = data_dir / "traffic_data.parquet"
    output_file = data_dir / "consolidated_data.parquet"
    
    consolidate_parquet_data(weather_file, traffic_file, output_file)

if __name__ == "__main__":
    main()