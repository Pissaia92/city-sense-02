# backend/pipelines/etl_weather.py
import os
import httpx
import polars as pl
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file located in the same directory as this script
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

# Directory and file paths
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "weather_data.parquet"

# OpenWeatherMap API configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"

# List of cities to fetch weather data for
CITIES = [
    "São Paulo", "Rio de Janeiro", "New York", "Dallas", "London",
    "Rome", "Lisboa", "Istambul", "Moscow", "Casablanca"
]

def kelvin_to_celsius(kelvin_temp: float) -> float:
    """Convert temperature from Kelvin to Celsius."""
    return kelvin_temp - 273.15

def get_weather_data(city: str) -> Optional[Dict[str, Any]]:

    if not OPENWEATHER_API_KEY:
        logger.error("OPENWEATHER_API_KEY not found in environment variables.")
        return None

    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "lang": "en_us" # Assuming you want Portuguese descriptions, adjust if needed
    }

    try:
        logger.info(f"🌍 Fetching weather data for {city}...")
        response = httpx.get(OPENWEATHER_URL, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        
        # Extract and process relevant data
        weather_info = {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": kelvin_to_celsius(data["main"]["temp"]),
            "feels_like": kelvin_to_celsius(data["main"]["feels_like"]),
            "temp_min": kelvin_to_celsius(data["main"]["temp_min"]),
            "temp_max": kelvin_to_celsius(data["main"]["temp_max"]),
            "pressure": data["main"]["pressure"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "wind_speed": data.get("wind", {}).get("speed", 0),
            "wind_deg": data.get("wind", {}).get("deg", 0),
            "clouds": data["clouds"]["all"],
            "visibility": data.get("visibility", None), # Meters
            "timestamp": datetime.now().isoformat(),
            "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).isoformat(),
            "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).isoformat(),
        }
        logger.info(f"✅ Weather data fetched successfully for {city}.")
        return weather_info

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching weather for {city}: {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching weather for {city}: {e}")
    except KeyError as e:
        logger.error(f"KeyError parsing weather data for {city}: Missing key {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching weather for {city}: {e}")

    return None

def save_weather_data(data_list: list) -> None:

    if not data_list:
        logger.warning("⚠️ No weather data to save.")
        return None

    try:
        # Create Polars DataFrame
        df = pl.DataFrame(data_list)
        # Ensure the data directory exists
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        # Save DataFrame to Parquet
        df.write_parquet(INPUT_FILE)
        logger.info(f"💾 Weather data saved to {INPUT_FILE}")
    except Exception as e:
        logger.error(f"❌ Error saving weather data to Parquet: {e}")

def run_weather_etl() -> dict:

    try:
        logger.info("🚀 Starting Weather ETL...")
        weather_data_list = []

        for city in CITIES:
            data = get_weather_data(city)
            if data:
                weather_data_list.append(data)
            
        if weather_data_list:
            save_weather_data(weather_data_list)
            logger.info("✅ Weather ETL completed successfully.")
            return {"status": "success", "cities_processed": len(weather_data_list)}
        else:
            logger.warning("⚠️ No weather data collected.")
            return {"status": "warning", "message": "No data collected."}

    except Exception as e:
        logger.error(f"❌ Error in Weather ETL pipeline: {e}")
        return {"status": "error", "message": str(e)}

# Allows running the script directly for testing
if __name__ == "__main__":
    result = run_weather_etl()
    print(result)