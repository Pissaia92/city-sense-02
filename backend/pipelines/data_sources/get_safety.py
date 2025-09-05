import random
import logging

logger = logging.getLogger(__name__)

def get_safety_data(city: str) -> dict:
    """Stub para obter dados de segurança (simulado por enquanto)"""
    try:
        safety_index = round(random.uniform(6.0, 8.5), 1)
        crime_rate = round((10 - safety_index) * 10, 1)
        
        logger.info(f"👮 Segurança simulada para {city}")
        return {"safety_index": safety_index, "crime_rate": crime_rate}
    except Exception as e:
        logger.error(f"❌ Erro ao simular segurança para {city}: {e}")
        return {"safety_index": 7.0, "crime_rate": 30.0}