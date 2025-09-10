from fastapi import APIRouter, HTTPException, Query
from slowapi import Limiter
from slowapi.util import get_remote_address
import os
import httpx
from dotenv import load_dotenv
import pandas as pd
from typing import Optional

# Load environment variables
load_dotenv()

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Get API key from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise RuntimeError("OPENWEATHER_API_KEY is required")

async def get_city_coordinates(city: str):
    """Get city coordinates from OpenWeatherMap Geocoding API"""
    async with httpx.AsyncClient() as client:
        geocode_url = f"http://api.openweathermap.org/geo/1.0/direct"
        geocode_params = {
            "q": city,
            "limit": 1,
            "appid": OPENWEATHER_API_KEY
        }
        
        response = await client.get(geocode_url, params=geocode_params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch city coordinates")
        
        data = response.json()
        if not data:
            raise HTTPException(status_code=404, detail="City not found")
        
        return data[0]

@router.get("/api/iqv")
@limiter.limit("30/minute")
async def get_iqv_data(
    request: Request,
    city: str = Query(..., description="City name")
):
    """Get IQV (Indice de Qualidade de Vida) data for a city"""
    try:
        # Get city coordinates
        city_data = await get_city_coordinates(city)
        lat, lon = city_data["lat"], city_data["lon"]
        
        # Fetch current weather data
        async with httpx.AsyncClient() as client:
            weather_url = "https://api.openweathermap.org/data/2.5/weather"
            weather_params = {
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }
            
            response = await client.get(weather_url, params=weather_params)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to fetch weather data")
            
            weather_data = response.json()
            
            # Calculate IQV components (simplified)
            temp = weather_data["main"]["temp"]
            humidity = weather_data["main"]["humidity"]
            wind_speed = weather_data["wind"]["speed"] if "wind" in weather_data else 0
            
            # Simple IQV calculation (this would be more complex in reality)
            iqv_temp = max(0, min(100, 100 - abs(temp - 22) * 3))  # Comfortable around 22°C
            iqv_humidity = max(0, min(100, 100 - abs(humidity - 40) * 2))  # Comfortable around 40%
            iqv_wind = max(0, min(100, 100 - wind_speed * 5))  # Lower wind is better
            
            iqv_overall = (iqv_temp + iqv_humidity + iqv_wind) / 3
            
            return {
                "city": city_data["name"],
                "country": city_data["country"],
                "latitude": lat,
                "longitude": lon,
                "temperature": temp,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "iqv_temperature": round(iqv_temp, 2),
                "iqv_humidity": round(iqv_humidity, 2),
                "iqv_wind": round(iqv_wind, 2),
                "iqv_overall": round(iqv_overall, 2),
                "timestamp": pd.Timestamp.now().isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/forecast")
@limiter.limit("30/minute")
async def get_forecast_data(
    request: Request,
    city: str = Query(..., description="City name")
):
    """Get 5-day weather forecast for a city"""
    try:
        # Get city coordinates
        city_data = await get_city_coordinates(city)
        lat, lon = city_data["lat"], city_data["lon"]
        
        # Fetch forecast data
        async with httpx.AsyncClient() as client:
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }
            
            response = await client.get(forecast_url, params=forecast_params)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to fetch forecast data")
            
            forecast_data = response.json()
            
            # Process forecast data
            processed_forecast = []
            for item in forecast_data["list"][:10]:  # First 10 forecast points
                processed_forecast.append({
                    "datetime": item["dt_txt"],
                    "temperature": item["main"]["temp"],
                    "humidity": item["main"]["humidity"],
                    "wind_speed": item["wind"]["speed"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"]
                })
            
            return {
                "city": city_data["name"],
                "country": city_data["country"],
                "latitude": lat,
                "longitude": lon,
                "forecast": processed_forecast
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))