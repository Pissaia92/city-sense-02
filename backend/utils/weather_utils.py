import httpx
from fastapi import HTTPException
import os

# Get API key from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

async def get_city_coordinates(city: str):
    """Get city coordinates from OpenWeatherMap Geocoding API"""
    try:
        if not OPENWEATHER_API_KEY:
            raise RuntimeError("OPENWEATHER_API_KEY is required")
            
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching city coordinates: {str(e)}")

async def get_current_weather(lat: float, lon: float):
    """Get current weather data from OpenWeatherMap"""
    try:
        if not OPENWEATHER_API_KEY:
            raise RuntimeError("OPENWEATHER_API_KEY is required")
            
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
            
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

async def get_forecast_data(lat: float, lon: float):
    """Get 5-day weather forecast from OpenWeatherMap"""
    try:
        if not OPENWEATHER_API_KEY:
            raise RuntimeError("OPENWEATHER_API_KEY is required")
            
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
            
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching forecast data: {str(e)}")