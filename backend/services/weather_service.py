import requests
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def get_weather_data(city: str) -> dict:
    """
    Busca dados climáticos da cidade especificada na API do OpenWeatherMap
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.error("OPENWEATHER_API_KEY não configurada")
        raise ValueError("OPENWEATHER_API_KEY não configurada")
    
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
        "lang": "pt"
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Extrair os dados relevantes
        return {
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "city": data["name"],
            "country": data["sys"]["country"],
            "updated_at": datetime.now().isoformat()
        }
    except requests.exceptions.RequestException as req_err:
        # ✅ CORREÇÃO 1: Tratamento seguro de response não definido
        status_code = None
        error_msg = str(req_err)
        
        if hasattr(req_err, 'response') and req_err.response is not None:
            status_code = req_err.response.status_code
            try:
                error_detail = req_err.response.json()
                error_msg = f"{error_msg} | Detalhes: {error_detail}"
            except:
                error_msg = f"{error_msg} | Detalhes: {req_err.response.text}"
        
        # ✅ CORREÇÃO 2: Evita acessar response não definido
        if status_code == 404:
            logger.error(f"Cidade não encontrada: {city} | Erro: {error_msg}")
            raise ValueError(f"Cidade '{city}' não encontrada")
        
        logger.error(f"Erro na requisição HTTP para {city}: {error_msg}")
        raise ValueError(f"Erro ao buscar dados climáticos: {error_msg}") from req_err
    except Exception as err:
        logger.error(f"Erro ao buscar dados climáticos para {city}: {str(err)}", exc_info=True)
        raise ValueError(f"Erro inesperado ao buscar dados climáticos: {str(err)}") from err

def get_forecast_data(city: str) -> list:
    """
    Busca dados de previsão climática da cidade especificada na API do OpenWeatherMap
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.error("OPENWEATHER_API_KEY não configurada")
        raise ValueError("OPENWEATHER_API_KEY não configurada")
    
    base_url = "http://api.openweathermap.org/data/2.5/forecast"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
        "lang": "pt"
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Processar os dados para obter uma previsão diária (uma entrada por dia)
        daily_forecast = []
        seen_dates = set()
        
        for item in data["list"]:
            # Extrair a data (sem hora)
            date_str = item["dt_txt"].split(" ")[0]
            
            # Pular se já vimos essa data
            if date_str in seen_dates:
                continue
                
            seen_dates.add(date_str)
            
            # Adicionar à previsão diária
            daily_forecast.append({
                "date": date_str,
                "temp": item["main"]["temp"],
                "condition": item["weather"][0]["description"]
            })
            
            # Parar após 7 dias
            if len(daily_forecast) >= 7:
                break
        
        if not daily_forecast:
            raise ValueError("Nenhum dado de previsão disponível")
            
        return daily_forecast
    except requests.exceptions.RequestException as req_err:
        # ✅ CORREÇÃO 3: Tratamento seguro de response não definido
        status_code = None
        error_msg = str(req_err)
        
        if hasattr(req_err, 'response') and req_err.response is not None:
            status_code = req_err.response.status_code
            try:
                error_detail = req_err.response.json()
                error_msg = f"{error_msg} | Detalhes: {error_detail}"
            except:
                error_msg = f"{error_msg} | Detalhes: {req_err.response.text}"
        
        # ✅ CORREÇÃO 4: Evita acessar response não definido
        if status_code == 404:
            logger.error(f"Cidade não encontrada para previsão: {city} | Erro: {error_msg}")
            raise ValueError(f"Cidade '{city}' não encontrada para previsão")
        
        logger.error(f"Erro na requisição de previsão para {city}: {error_msg}")
        raise ValueError(f"Erro ao buscar dados de previsão: {error_msg}") from req_err
    except Exception as err:
        logger.error(f"Erro ao buscar dados de previsão para {city}: {str(err)}", exc_info=True)
        raise ValueError(f"Erro inesperado ao buscar dados de previsão: {str(err)}") from err