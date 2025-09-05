# backend/pipelines/data_processing.py
import polars as pl
import os
import json
from datetime import datetime
import logging
from pathlib import Path
from ml.iqv_predictor import IQVPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Funções de serviço (simuladas, mas podem ser substituídas por chamadas reais) ---
def get_weather_data(city: str) -> dict:
    """Stub para obter dados climáticos"""
    # TODO: Substituir por chamada real à API (OpenWeatherMap)
    logger.info(f"📡 Buscando dados climáticos reais para {city}")
    return {"temperature": 25.0, "humidity": 60.0, "description": "Céu limpo"}

def get_traffic_data(city: str) -> dict:
    """Stub para obter dados de trânsito"""
    # TODO: Substituir por chamada real à API (Google Maps/OSRM)
    logger.info(f"🚗 Buscando dados de trânsito reais para {city}")
    return {"traffic_delay": 15.0, "traffic_level": "moderado"}

def get_air_quality_data(city: str) -> dict:
    """Stub para obter dados de qualidade do ar"""
    # TODO: Substituir por chamada real à API
    logger.info(f"💨 Buscando dados de qualidade do ar reais para {city}")
    return {"aqi": 45, "pollutants": ["PM2.5", "O3"]}

def get_safety_data(city: str) -> dict:
    """Stub para obter dados de segurança"""
    # TODO: Substituir por dados reais de segurança urbana
    logger.info(f"👮 Buscando dados de segurança reais para {city}")
    return {"safety_index": 7.5, "crime_rate": 35.0}

def save_to_database(city: str, data: dict):
    """Salva dados no banco de dados ou arquivo"""
    data_dir = Path(__file__).parent.parent / "data"
    os.makedirs(data_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{city.replace(' ', '_')}_{timestamp}.json"
    filepath = data_dir / filename
    
    with open(filepath, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"💾 Dados salvos em {filepath}")

class DataProcessor:
    def __init__(self, city: str, data: pl.DataFrame):
        self.city = city
        self.raw_data = data
        self.processed_data = {}
        model_path = Path(__file__).parent.parent / "ml" / "models" / "qv_model.pkl"
        self.predictor = IQVPredictor(model_path=str(model_path))

    def extract(self):
        """Extrai dados de múltiplas fontes (clima, trânsito, qualidade do ar, etc.)"""
        logger.info(f"🔍 Extraindo dados para {self.city}")
        self.raw_data = {
            'weather': get_weather_data(self.city),
            'traffic': get_traffic_data(self.city),
            'air_quality': get_air_quality_data(self.city),
            'safety': get_safety_data(self.city)
        }
        return self

    def transform(self) -> 'DataProcessor':
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
            
            # Feature Engineering
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
            
            # Prepara dados para o modelo
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
        save_to_database(self.city, self.processed_data)
        return self.processed_data
        
    def process(self):
        """Executa todo o pipeline (extract, transform, load)."""
        logger.info(f"🔄 Iniciando pipeline completo para {self.city}")
        return self.extract().transform().load()
