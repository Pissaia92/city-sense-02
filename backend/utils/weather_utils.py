import httpx
import os
import sys
from fastapi import HTTPException
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from urllib.parse import quote

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

# WeatherAPI base URL
WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1"

# GeoNames configuration
GEONAMES_USERNAME = os.getenv("GEONAMES_USERNAME", "demo")
WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2"


async def get_current_weather_and_forecast(city: str) -> Dict[str, Any]:
    """Fetch current weather and forecast from WeatherAPI."""
    api_key = os.getenv("WEATHERAPI_KEY")
    if not api_key:
        raise RuntimeError("WEATHERAPI_KEY is required")

    async with httpx.AsyncClient() as client:
        url = f"{WEATHER_API_BASE_URL}/forecast.json"
        params = {
            "key": api_key,
            "q": city,
            "days": 6,
            "aqi": "yes",
            "alerts": "no"
        }

        try:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                error_msg = f"Failed to fetch data from WeatherAPI. Status: {response.status_code}"
                try:
                    error_data = response.json()
                    if "error" in error_data:
                        error_msg += f". API Error: {error_data['error'].get('message', 'Unknown error')}"
                except Exception:
                    pass
                raise HTTPException(status_code=500, detail=error_msg)

            return response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=500, detail="Timeout when fetching data from WeatherAPI")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")


def process_weatherapi_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process raw WeatherAPI data into a structured format for frontend."""
    try:
        location = raw_data["location"]
        current = raw_data["current"]
        forecast_list = raw_data["forecast"]["forecastday"]

        city_name = location["name"]
        country = location["country"]
        latitude = location["lat"]
        longitude = location["lon"]
        temperature = current["temp_c"]
        humidity = current["humidity"]
        wind_speed_mph = current["wind_mph"]
        wind_speed = wind_speed_mph * 0.44704  # Convert to m/s
        weather_desc = current["condition"]["text"]

        # IQV Components
        temp_iqv = max(0, min(10, (30 - abs(temperature - 22)) / 3))
        humidity_iqv = max(0, min(10, (100 - humidity) / 5))
        wind_iqv = max(0, min(10, (15 - wind_speed) / 1.5))
        overall_iqv = (temp_iqv + humidity_iqv + wind_iqv) / 3

        # Forecast (5 days)
        processed_forecast = []
        for day_data in forecast_list[:5]:
            day_info = day_data["day"]
            processed_forecast.append({
                "datetime": day_data["date"],
                "temperature": day_info["avgtemp_c"],
                "humidity": day_info["avghumidity"],
                "wind_speed": day_info["maxwind_mph"] * 0.44704,
                "description": day_info["condition"]["text"],
                "icon": day_info["condition"]["icon"]
            })

        return {
            "city": city_name,
            "country": country,
            "temperature": round(temperature, 2),
            "humidity": humidity,
            "wind_speed": round(wind_speed, 2),
            "iqv_components": {
                "temperature": round(temp_iqv, 2),
                "humidity": round(humidity_iqv, 2),
                "wind": round(wind_iqv, 2),
                "overall": round(overall_iqv, 2),
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latitude": latitude,
            "longitude": longitude,
            "weather": {"description": weather_desc},
            "forecast": processed_forecast,
            "state": None,
            "population": None,
            "hdi": None,
            "hdi_year": None
        }

    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing key in WeatherAPI data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")


async def get_air_pollution_data(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Fetch air pollution data from OpenWeatherMap."""
    if not settings.OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY not configured.")
        return None

    try:
        async with httpx.AsyncClient() as client:
            url = "http://api.openweathermap.org/data/2.5/air_pollution"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": settings.OPENWEATHER_API_KEY
            }
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data.get("list"):
                current_pollution = data["list"][0]
                aqi_value = current_pollution.get("main", {}).get("aqi")
                components = current_pollution.get("components", {})
                return {
                    "us_epa_index": aqi_value,
                    # "pm2_5": components.get("pm2_5"),
                    # "pm10": components.get("pm10"),
                }
    except Exception as e:
        print(f"Error fetching air pollution data: {e}")
    return None


async def fetch_enriched_city_data(city_name: str, country_code: str) -> Dict[str, Union[str, int, float, None]]:
    """Fetch city data from GeoNames and World Bank."""
    enriched_data: Dict[str, Union[str, int, float, None]] = {
        "state": None,
        "population": None,
        "hdi": None,
        "hdi_year": None
    }

    # GeoNames
    if not GEONAMES_USERNAME or GEONAMES_USERNAME == "demo":
        print("Warning: GEONAMES_USERNAME not set or using demo.")

    try:
        geonames_url = (
            f"http://api.geonames.org/searchJSON?"
            f"q={quote(city_name)}&maxRows=1&username={GEONAMES_USERNAME}"
        )
        async with httpx.AsyncClient() as client:
            response = await client.get(geonames_url, timeout=10.0)
        response.raise_for_status()
        geonames_data = response.json()

        if geonames_data.get("geonames"):
            geoname = geonames_data["geonames"][0]
            enriched_data["state"] = geoname.get("adminName1")
            try:
                enriched_data["population"] = int(geoname.get("population", 0))
            except (ValueError, TypeError):
                pass

    except Exception as e:
        print(f"GeoNames error: {e}")

    # World Bank HDI
    if country_code:
        try:
            indicator_code = "SP.HUM.IDX"
            wb_url = f"{WORLD_BANK_BASE_URL}/country/{country_code}/indicator/{indicator_code}"
            wb_params = {"format": "json", "per_page": "5", "date": "2010:2030"}

            async with httpx.AsyncClient() as client:
                wb_response = await client.get(wb_url, params=wb_params, timeout=10.0)
                wb_response.raise_for_status()
                wb_data = wb_response.json()

                if len(wb_data) > 1 and isinstance(wb_data[1], list):
                    for entry in wb_data[1]:
                        if entry and entry.get("value") is not None:
                            try:
                                enriched_data["hdi"] = float(entry["value"])
                                enriched_data["hdi_year"] = int(entry["date"])
                                break
                            except (ValueError, TypeError):
                                continue
        except Exception as e:
            print(f"World Bank error: {e}")

    return enriched_data


async def get_iqv_data(city: str) -> Dict[str, Any]:
    """Main function to fetch IQV data using WeatherAPI and enriched data."""
    try:
        raw_weather_data = await get_current_weather_and_forecast(city)
        processed_data = process_weatherapi_data(raw_weather_data)

        current_data = raw_weather_data.get("current", {})
        raw_aqi_data = current_data.get("air_quality", {})
        formatted_aqi_data = {"us_epa_index": raw_aqi_data.get("us-epa-index")} if raw_aqi_data else None
        uv_index = current_data.get("uv")

        country_code = raw_weather_data["location"].get("country", "")[:2].upper()
        enriched_data = await fetch_enriched_city_data(city, country_code)

        processed_data.update({
            "state": enriched_data.get("state"),
            "population": enriched_data.get("population"),
            "hdi": enriched_data.get("hdi"),
            "hdi_year": enriched_data.get("hdi_year"),
            "aqi": formatted_aqi_data,
            "uv_index": uv_index
        })

        return processed_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing IQV data: {str(e)}")