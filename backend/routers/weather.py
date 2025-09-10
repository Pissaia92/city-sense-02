from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import pandas as pd
import math
import sys
import os

current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

# Importar usando caminho absoluto
import utils.weather_utils as weather_utils

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

def calculate_iqv_components(temp: float, humidity: float, wind_speed: float):
    """Calculate IQV components based on weather data"""
    # Temperature component (comfortable around 22°C)
    iqv_temp = max(0, min(100, 100 - abs(temp - 22) * 3))
    
    # Humidity component (comfortable around 40%)
    iqv_humidity = max(0, min(100, 100 - abs(humidity - 40) * 2))
    
    # Wind component (lower wind is better)
    iqv_wind = max(0, min(100, 100 - wind_speed * 5))
    
    # Overall IQV
    iqv_overall = (iqv_temp + iqv_humidity + iqv_wind) / 3
    
    return {
        "temperature": round(iqv_temp, 2),
        "humidity": round(iqv_humidity, 2),
        "wind": round(iqv_wind, 2),
        "overall": round(iqv_overall, 2)
    }

@router.get("/api/iqv")
@limiter.limit("30/minute")
async def get_iqv_data(
    request: Request,
    city: str = Query(..., description="City name", example="São Paulo")
):
    """Get IQV (Indice de Qualidade de Vida) data for a city"""
    try:
        # Get city coordinates
        city_data = await weather_utils.get_city_coordinates(city)
        lat, lon = city_data["lat"], city_data["lon"]
        
        # Fetch current weather data
        weather_data = await weather_utils.get_current_weather(lat, lon)
        
        # Extract weather information
        temp = weather_data["main"]["temp"]
        humidity = weather_data["main"]["humidity"]
        wind_speed = weather_data["wind"]["speed"] if "wind" in weather_data else 0
        
        # Calculate IQV components
        iqv_components = calculate_iqv_components(temp, humidity, wind_speed)
        
        # Create response
        response = {
            "city": city_data["name"],
            "country": city_data["country"],
            "latitude": lat,
            "longitude": lon,
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "iqv_components": iqv_components,
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
        return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/forecast")
@limiter.limit("30/minute")
async def get_forecast_data_endpoint(
    request: Request,
    city: str = Query(..., description="City name", example="Rio de Janeiro")
):
    """Get 5-day weather forecast for a city"""
    try:
        # Get city coordinates
        city_data = await weather_utils.get_city_coordinates(city)
        lat, lon = city_data["lat"], city_data["lon"]
        
        # Fetch forecast data
        forecast_data = await weather_utils.get_forecast_data(lat, lon)
        
        # Process forecast data
        processed_forecast = []
        for item in forecast_data["list"][:10]:  # First 10 forecast points
            forecast_point = {
                "datetime": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "humidity": item["main"]["humidity"],
                "wind_speed": item["wind"]["speed"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            }
            processed_forecast.append(forecast_point)
        
        # Create response
        response = {
            "city": city_data["name"],
            "country": city_data["country"],
            "latitude": lat,
            "longitude": lon,
            "forecast": processed_forecast
        }
        
        return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))