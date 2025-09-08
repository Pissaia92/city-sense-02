# backend/pipelines/data_processor.py
import polars as pl
import numpy as np
from datetime import datetime
import logging
from pathlib import Path
from .data_sources import get_weather, get_traffic, get_air_quality, get_safety
from .utils import utils
from ml.iqv_predictor import IQVPredictor

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self, city: str):
        self.city = city
        self.city = utils.normalize_city_name(city)
        self.raw_data = {}
        self.processed_data = {}
        # Caminho do modelo - ajustado para usar Pathlib
        model_path = Path(__file__).parent.parent / "ml" / "models" / "qv_model.pkl"
        self.predictor = IQVPredictor(model_path=str(model_path))

    def extract(self):
        """Extrai dados de múltiplas fontes."""
        logger.info(f"🔍 Extraindo dados para {self.city}")
        self.raw_data = {
            'weather': get_weather.get_weather_data(self.city),
            'traffic': get_traffic.get_traffic_data(self.city),
            'air_quality': get_air_quality.get_air_quality_data(self.city),
            'safety': get_safety.get_safety_data(self.city)
        }
        return self
    
    def _get_season(self, month: int) -> int:
        if month in [12, 1, 2]:
            return 1  # Verão
        elif month in [3, 4, 5]:
            return 2  # Outono
        elif month in [6, 7, 8]:
            return 3  # Inverno
        else:
            return 4  # Primavera

    def transform(self):
        """Processa os dados brutos e faz a previsão de IQV."""
        try:
            if not self.raw_data:
                raise ValueError("Nenhum dado bruto disponível para transformação.")
                
            # Cria DataFrame com os dados brutos
            df = pl.DataFrame([{
                'temperature': self.raw_data['weather']['temperature'],
                'humidity': self.raw_data['weather']['humidity'],
                'traffic_delay': self.raw_data['traffic']['traffic_delay'],
                'aqi': self.raw_data['air_quality']['aqi'],
                'safety_index': self.raw_data['safety']['safety_index']
            }])
            
            # Feature Engineering com Polars
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
            
            # Verifica se o DataFrame tem dados
            if df.height == 0:
                raise ValueError("DataFrame vazio durante a transformação.")
            
            # Acessa os valores da primeira linha corretamente
            first_row = df.row(0)
            first_row_dict = dict(zip(df.columns, first_row))
            
            # Prepara dados para o modelo
            model_data = {
            'temperature': float(first_row_dict.get('temperature', 0)),
            'humidity': float(first_row_dict.get('humidity', 0)),
            'traffic_delay': float(first_row_dict.get('traffic_delay', 0)),
            # --- Features derivadas ---
            'temp_humidity_interaction': float(first_row_dict.get('temperature', 0)) * float(first_row_dict.get('humidity', 0)),
            'is_weekend': 1 if datetime.now().weekday() >= 5 else 0,
            'season': self._get_season(datetime.now().month)
            }

            # Faz previsão com o modelo
            predicted_iqv = self.predictor.predict(model_data)
            logger.info(f"🔮 IQV previsto para {self.city}: {predicted_iqv:.2f}")

            # Cria dados processados
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
        utils.save_to_database(self.city, self.processed_data)
        return self.processed_data
        
    def process(self):
        """Executa todo o pipeline (extract, transform, load)."""
        logger.info(f"🔄 Iniciando pipeline completo para {self.city}")
        return self.extract().transform().load()