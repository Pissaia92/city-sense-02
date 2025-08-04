# backend/pipelines/data_processing.py
import pandas as pd
import os
import json
from datetime import datetime
import logging
from ml.iqv_predictor import IQVPredictor

logger = logging.getLogger(__name__)

# Funções de serviço (simuladas para desenvolvimento)
def get_weather_data(city: str) -> dict:
    """Stub para obter dados climáticos"""
    # Em um projeto real, isso chamaria uma API externa
    return {
        "temperature": 25.0,
        "humidity": 60.0,
        "description": "Céu limpo"
    }

def get_traffic_data(city: str) -> dict:
    """Stub para obter dados de trânsito"""
    return {
        "traffic_delay": 15.0,
        "traffic_level": "moderado"
    }

def get_air_quality_data(city: str) -> dict:
    """Stub para obter dados de qualidade do ar"""
    return {
        "aqi": 45,
        "pollutants": ["PM2.5", "O3"]
    }

def get_safety_data(city: str) -> dict:
    """Stub para obter dados de segurança"""
    return {
        "safety_index": 7.5,
        "crime_rate": 35.0
    }

def save_to_database(city: str, data: dict):
    """Salva dados no banco de dados (stub para desenvolvimento)"""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{city.replace(' ', '_')}_{timestamp}.json"
    filepath = os.path.join(data_dir, filename)
    
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    
    logger.info(f"Dados salvos em {filepath}")

class DataPipeline:
    def __init__(self, city: str):
        self.city = city
        self.raw_data = {}
        self.processed_data = {}
        self.predictor = IQVPredictor(model_path="./models/iqv_predictor.pkl")
        
    def extract(self):
        """Extrai dados de múltiplas fontes (clima, trânsito, qualidade do ar, etc.)"""
        self.raw_data = {
            'weather': get_weather_data(self.city),
            'traffic': get_traffic_data(self.city),
            'air_quality': get_air_quality_data(self.city),
            'safety': get_safety_data(self.city)
        }
        return self
        
    def transform(self):
        """Aplica transformações complexas com Pandas"""
        try:
            # Cria um DataFrame com os dados brutos
            df = pd.DataFrame([{
                'temperature': self.raw_data['weather']['temperature'],
                'humidity': self.raw_data['weather']['humidity'],
                'traffic_delay': self.raw_data['traffic']['traffic_delay'],
                'aqi': self.raw_data['air_quality']['aqi'],
                'safety_index': self.raw_data['safety']['safety_index']
            }])
            
            # Normalização e criação de features
            df['temp_normalized'] = (df['temperature'] - 22.5) / 10
            df['humidity_score'] = 10 - abs(df['humidity'] - 50) / 5
            df['traffic_score'] = df['traffic_delay'].apply(lambda x: max(0, min(10, 10 - x / 3)))
            
            # Prepara dados para o modelo
            model_data = {
                'temperature': float(df['temperature'].iloc[0]),
                'humidity': float(df['humidity'].iloc[0]),
                'traffic_delay': float(df['traffic_delay'].iloc[0]),
                'day_of_week': datetime.now().weekday(),
                'month': datetime.now().month
            }
            
            # Faz previsão com o modelo
            predicted_iqv = self.predictor.predict(model_data)
            
            # Cria dados processados
            self.processed_data = {
                'city': self.city,
                'temperature': float(df['temperature'].iloc[0]),
                'humidity': float(df['humidity'].iloc[0]),
                'traffic_delay': float(df['traffic_delay'].iloc[0]),
                'aqi': float(df['aqi'].iloc[0]),
                'safety_index': float(df['safety_index'].iloc[0]),
                'temp_normalized': float(df['temp_normalized'].iloc[0]),
                'humidity_score': float(df['humidity_score'].iloc[0]),
                'traffic_score': float(df['traffic_score'].iloc[0]),
                'predicted_iqv': predicted_iqv,
                'timestamp': datetime.now().isoformat()
            }
            
            return self
        except Exception as e:
            logger.error(f"Erro na transformação de dados: {str(e)}")
            raise
            
    def load(self):
        """Salva em banco de dados ou armazenamento"""
        save_to_database(self.city, self.processed_data)
        return self.processed_data
    
    def process(self):
        """Executa todo o pipeline (extract, transform, load)"""
        return self.extract().transform().load()