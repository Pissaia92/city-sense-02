from datetime import datetime, timezone
import os
import requests
from typing import Dict, Any
import logging
from dotenv import load_dotenv
import httpx

load_dotenv()


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Obter chave da API do ambiente
API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not API_KEY:
    logger.error("OPENWEATHER_API_KEY não está definida nas variáveis de ambiente")
    raise RuntimeError("OPENWEATHER_API_KEY é obrigatória")

def get_weather_data(city: str) -> Dict[str, Any]:
    logger.info(f"Buscando dados climáticos para: {city}")
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={API_KEY}"
    
    response = None  # ✅ Adicione esta linha
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        result = {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": round(data["main"]["temp"], 1),
            "description": data["weather"][0]["description"].title(),
            "humidity": data["main"]["humidity"],
            "latitude": data["coord"]["lat"],
            "longitude": data["coord"]["lon"],
            "updated_at": data["dt"]
        }
        logger.info(f"Dados climáticos obtidos com sucesso para {city}")
        return result
        
    except requests.exceptions.HTTPError as e:
        if response is not None and response.status_code == 404:
            logger.warning(f"Cidade não encontrada: {city}")
            raise ValueError(f"Cidade '{city}' não encontrada")
        else:
            logger.error(f"Erro HTTP ao buscar dados para {city}: {e}")
            raise ValueError(f"Erro ao buscar dados climáticos: {e}")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar dados para {city}: {e}", exc_info=True)
        raise ValueError(f"Erro ao buscar dados climáticos: {e}")

def get_forecast_data(city: str) -> list:
    logger.info(f"Buscando previsão para: {city}")
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={API_KEY}"
    
    response = None
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Agrupar por dia
        daily_forecast = {}
        
        for item in data["list"]:
            dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
            date_key = dt.strftime("%Y-%m-%d")
            
            if date_key not in daily_forecast:
                # Define o timestamp como meia-noite UTC do dia
                midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
                timestamp = int(midnight.timestamp())
                daily_forecast[date_key] = {
                    "date": timestamp,  #
                    "temps": [],
                    "descriptions": [],
                    "humidity": item["main"]["humidity"]
                }
            
            main = item["main"]
            daily_forecast[date_key]["temps"].append(main["temp"])
            daily_forecast[date_key]["descriptions"].append(main["temp_min"])  # guardamos para min/max depois
            
        # Montar o resultado final
        forecast = []
        for date_key, day_data in daily_forecast.items():
            temps = day_data["temps"]
            min_temp = min(temps)
            max_temp = max(temps)
            avg_temp = sum(temps) / len(temps)
            
            # Pega a descrição do meio do dia (ou primeira)
            # Aqui você pode melhorar com peso por horário
            description = data["list"][0]["weather"][0]["description"].title()  # simplificado
            
            forecast.append({
                "date": day_data["date"],
                "temperature": round(avg_temp, 1),
                "minTemperature": round(min_temp, 1),
                "maxTemperature": round(max_temp, 1),
                "description": description,
                "humidity": day_data["humidity"]
            })
        
        logger.info(f"Previsão obtida com sucesso para {city}")
        return forecast
        
    except Exception as e:
        logger.error(f"Erro ao buscar previsão para {city}: {e}", exc_info=True)
        raise ValueError(f"Erro ao buscar previsão climática: {e}")

async def get_air_pollution(lat: float, lon: float) -> int:
    """
    Obtém índice de qualidade do ar (AQI).
    """
    logger.info(f"Buscando poluição do ar para coordenadas: {lat}, {lon}")
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            aqi = data["list"][0]["main"]["aqi"]
            logger.info(f"Poluição do ar obtida: AQI={aqi}")
            return aqi
        except Exception as e:
            logger.error(f"Erro ao buscar poluição do ar: {e}", exc_info=True)
            # Retorna valor padrão em caso de erro
            return 3

async def get_noise_pollution(lat: float, lon: float) -> float:
    """
    Obtém nível de ruído em dB.
    """
    logger.info(f"Buscando ruído urbano para coordenadas: {lat}, {lon}")
    url = f"http://api.openweathermap.org/data/2.5/noise?lat={lat}&lon={lon}&appid={API_KEY}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            noise = data["noise"]
            logger.info(f"Nível de ruído obtido: {noise} dB")
            return noise
        except Exception as e:
            logger.error(f"Erro ao buscar ruído urbano: {e}", exc_info=True)
            # Retorna valor padrão em caso de erro
            return 65.0