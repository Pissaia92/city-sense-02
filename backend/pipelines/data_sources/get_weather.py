# backend/pipelines/data_sources/weather.py
import httpx
import os
import logging
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

logger = logging.getLogger(__name__)

# Obtém a chave da API do ambiente
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather_data(city: str) -> dict:
    """
    Obtém dados climáticos reais da API do OpenWeatherMap.
    """
    if not OPENWEATHER_API_KEY:
        logger.error("❌ Chave da API do OpenWeatherMap não encontrada. Verifique o arquivo .env")
        return {"temperature": 25.0, "humidity": 60.0, "description": "Céu limpo (simulado - chave não encontrada)"}

    try:
        url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
            "lang": "pt_br"
        }
        
        response = httpx.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        weather_info = {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"]
        }
        
        logger.info(f"🌤️ Dados climáticos obtidos para {city}")
        return weather_info
        
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ Erro HTTP ao buscar dados climáticos para {city}: {e.response.status_code}")
        return {"temperature": 25.0, "humidity": 60.0, "description": "Céu limpo (simulado - erro HTTP)"}
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao buscar dados climáticos para {city}: {e}")
        return {"temperature": 25.0, "humidity": 60.0, "description": "Céu limpo (simulado - erro desconhecido)"}