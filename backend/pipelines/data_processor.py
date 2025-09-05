import polars as pl
import numpy as np
from datetime import datetime
import logging
from pathlib import Path
from ml.iqv_predictor import IQVPredictor
from .data_sources import get_weather_data, get_traffic_data, get_air_quality_data, get_safety_data
from .utils.helpers import save_to_database

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self, city: str):
        self.city = city
        self.raw_data = {}
        self.processed_data = {}
        model_path = Path(__file__).parent.parent / "ml" / "models" / "qv_model.pkl"
        self.predictor = IQVPredictor(model_path=str(model_path))

    def extract(self):
        """Extrai dados de múltiplas fontes."""
        logger.info(f"🔍 Extraindo dados para {self.city}")
        self.raw_data = {
            'weather': get_weather_data(self.city),
            'traffic': get_traffic_data(self.city),
            'air_quality': get_air_quality_data(self.city),
            'safety': get_safety_data(self.city)
        }
        return self

    def transform(self):
        """Processa os dados brutos e faz a previsão de IQV."""
        try:
            if not self.raw_data:
                raise ValueError("Nenhum dado bruto disponível para transformação.")
                
            df = pl.DataFrame([{
                'temperature': self.raw_data['weather']['temperature'],
                'humidity': self.raw_data['weather']['humidity'],
                'traffic_delay': self.raw_data['traffic']['traffic_delay'],
                'aqi': self.raw_data['air_quality']['aqi'],
                'safety_index': self.raw_data['safety']['safety_index']
            }])
            
            df = df.with_columns([
                ((pl.col("temperature") - 10) / 30).alias("temp_normalized")
            ])
            
            df = df.with_columns([
                pl.when(pl.col("humidity") <= 40).then(10)
                  .when(pl.col("humidity") >= 70).then(0)
                  .otherwise(10 - (pl.col("humidity") - 40) * 10 / 30)
                  .alias("humidity_score")
            ])
            
            df = df.with_columns([
                (10 - pl.col("traffic_delay") / 3).clip(0, 10).alias("traffic_score")
            ])
            
            if df.height == 0:
                raise ValueError("DataFrame vazio durante a transformação.")
            
            first_row = df.row(0)
            first_row_dict = dict(zip(df.columns, first_row))
            
            model_data = {
                'temperature': float(first_row_dict.get('temperature', 0)),
                'humidity': float(first_row_dict.get('humidity', 0)),
                'traffic_delay': float(first_row_dict.get('traffic_delay', 0)),
                'day_of_week': datetime.now().weekday(),
                'month': datetime.now().month,
            }

            predicted_iqv = self.predictor.predict(model_data)
            logger.info(f"🔮 IQV previsto para {self.city}: {predicted_iqv:.2f}")

            self.processed_data = {
                'city': self.city,
                'temperature': float(first_row_dict.get('temperature', 0)),
                'humidity': float(first_row_dict.get('humidity', 0)),
                'traffic_delay': float(first_row_dict.get('traffic_delay', 0)),
                'aqi': float(first_row_dict.get('aqi', 0)),
                'safety_index': float(first_row_dict.get('safety_index', 0)),
                'temp_normalized': float(first_row_dict.get('temp_normalized', 0)),
                'humidity_score': float(first_row_dict.get('humidity_score', 0)),
                'traffic_score': float(first_row_dict.get('traffic_score', 0)),
                'predicted_iqv': predicted_iqv,
                'timestamp': datetime.now().isoformat()
            }
            
            return self
            
        except Exception as e:
            logger.error(f"❌ Erro na transformação de dados: {e}")
            raise

    def load(self):
        """Salva em banco de dados ou armazenamento."""
        if not self.processed_data:
            logger.warning("⚠️ Nenhum dado processado para salvar.")
            return None
        save_to_database(self.city, self.processed_data)
        return self.processed_data
        
    def process(self):
        """Executa todo o pipeline (extract, transform, load)."""
        logger.info(f"🔄 Iniciando pipeline completo para {self.city}")
        return self.extract().transform().load()