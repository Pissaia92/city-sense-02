import random
import logging

logger = logging.getLogger(__name__)

def get_air_quality_data(city: str) -> dict:
    """Stub para obter dados de qualidade do ar (simulado por enquanto)"""
    try:
        large_cities = ["Sao Paulo", "Rio de Janeiro", "New York", "London", "Tokyo"]
        if city.replace(" ", "").replace("_", "") in [c.replace(" ", "") for c in large_cities]:
            aqi = random.randint(50, 100)
        else:
            aqi = random.randint(20, 50)
            
        pollutants = []
        if aqi > 70:
            pollutants = ["PM2.5", "PM10"]
        elif aqi > 50:
            pollutants = ["PM2.5"]
            
        logger.info(f"💨 Qualidade do ar simulada para {city}")
        return {"aqi": aqi, "pollutants": pollutants}
    except Exception as e:
        logger.error(f"❌ Erro ao simular qualidade do ar para {city}: {e}")
        return {"aqi": 50, "pollutants": []}