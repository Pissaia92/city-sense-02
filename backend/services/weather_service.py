# backend/services/weather_service.py
import os
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_weather_data(city: str) -> dict:
    """
    Obtém dados climáticos para uma cidade específica usando a API do OpenWeather.
    Agora inclui latitude e longitude para uso no mapa.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.error("OPENWEATHER_API_KEY não está definida no .env")
        raise ValueError("Configuração da API inválida. Verifique seu arquivo .env")
    
    try:
        # Primeiro obter coordenadas da cidade
        geocode_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}"
        geocode_response = requests.get(geocode_url)
        geocode_response.raise_for_status()
        
        if not geocode_response.json():
            logger.error(f"Cidade '{city}' não encontrada na API de geocodificação")
            raise ValueError(f"Cidade '{city}' não encontrada")
        
        geocode_data = geocode_response.json()[0]
        lat = geocode_data["lat"]
        lon = geocode_data["lon"]
        country = geocode_data.get("country", "N/A")
        
        # Agora obter dados climáticos usando as coordenadas
        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        weather_response = requests.get(weather_url)
        weather_response.raise_for_status()
        
        weather_data = weather_response.json()
        
        return {
            "city": city,
            "country": country,
            "latitude": lat,
            "longitude": lon,
            "temperature": weather_data["main"]["temp"],
            "description": weather_data["weather"][0]["description"],
            "humidity": weather_data["main"]["humidity"],
            "updated_at": datetime.now().isoformat()
        }
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Erro na requisição à API do OpenWeather: {str(e)}")
        if e.response and e.response.status_code == 401:
            raise ValueError("Chave da API do OpenWeather inválida")
        elif e.response and e.response.status_code == 404:
            raise ValueError(f"Cidade '{city}' não encontrada")
        else:
            raise ValueError("Erro ao conectar com a API do OpenWeather")

def get_forecast_data(city: str) -> list:
    """
    Obtém dados de previsão climática para os próximos 7 dias.
    Agora calcula corretamente a temperatura média, mínima e máxima para cada dia.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.error("OPENWEATHER_API_KEY não está definida no .env")
        raise ValueError("Configuração da API inválida. Verifique seu arquivo .env")
    
    try:
        # Primeiro obter coordenadas da cidade
        geocode_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}"
        geocode_response = requests.get(geocode_url)
        geocode_response.raise_for_status()
        
        if not geocode_response.json():
            logger.error(f"Cidade '{city}' não encontrada na API de geocodificação")
            raise ValueError(f"Cidade '{city}' não encontrada")
        
        geocode_data = geocode_response.json()[0]
        lat = geocode_data["lat"]
        lon = geocode_data["lon"]
        country = geocode_data.get("country", "N/A")
        
        # Agora obter previsão usando as coordenadas
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        forecast_response = requests.get(forecast_url)
        forecast_response.raise_for_status()
        
        forecast_data = forecast_response.json()
        
        # Processar os dados para obter uma previsão diária CORRETA
        daily_data = {}
        
        for item in forecast_data["list"]:
            # Extrai apenas a data (sem hora)
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
            
            # Inicializa o dia se não existir
            if date not in daily_data:
                daily_data[date] = {
                    "temperatures": [],
                    "min_temperatures": [],
                    "max_temperatures": [],
                    "descriptions": [],
                    "humidity": []
                }
            
            # Coleta todos os pontos de dados do dia
            daily_data[date]["temperatures"].append(item["main"]["temp"])
            daily_data[date]["min_temperatures"].append(item["main"]["temp_min"])
            daily_data[date]["max_temperatures"].append(item["main"]["temp_max"])
            daily_data[date]["descriptions"].append(item["weather"][0]["description"])
            daily_data[date]["humidity"].append(item["main"]["humidity"])
        
        # Calcula os valores agregados para cada dia
        daily_forecast = []
        for date, values in daily_data.items():
            # Calcula a temperatura média do dia
            avg_temp = sum(values["temperatures"]) / len(values["temperatures"])
            
            # Calcula a descrição mais comum do dia
            from collections import Counter
            description_counts = Counter(values["descriptions"])
            most_common_desc = description_counts.most_common(1)[0][0]
            
            # Calcula a umidade média
            avg_humidity = sum(values["humidity"]) / len(values["humidity"])
            
            daily_forecast.append({
                "date": date,
                "temperature": avg_temp,
                "minTemperature": min(values["min_temperatures"]),
                "maxTemperature": max(values["max_temperatures"]),
                "description": most_common_desc,
                "humidity": avg_humidity
            })
            
            if len(daily_forecast) == 7:  # Limitar a 7 dias
                break
        
        return daily_forecast
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Erro na requisição à API do OpenWeather: {str(e)}")
        if e.response and e.response.status_code == 401:
            raise ValueError("Chave da API do OpenWeather inválida")
        elif e.response and e.response.status_code == 404:
            raise ValueError(f"Cidade '{city}' não encontrada")
        else:
            raise ValueError("Erro ao conectar com a API do OpenWeather")