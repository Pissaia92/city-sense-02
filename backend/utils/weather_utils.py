import httpx
import os
import sys
from fastapi import HTTPException
from datetime import datetime
from typing import Dict, Any, List, Optional
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

# Base url WeatherAPI
WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1"

async def get_current_weather_and_forecast(city: str) -> Dict[str, Any]:
    try:
        WEATHERAPI_KEY = os.getenv("WEATHERAPI_KEY", "")
        if not WEATHERAPI_KEY:
            raise RuntimeError("WEATHERAPI_KEY is required")

        async with httpx.AsyncClient() as client:
            # Endpoint WeatherAPI 
            url = f"{WEATHER_API_BASE_URL}/forecast.json"
            params = {
                "key": WEATHERAPI_KEY,
                "q": city,
                "days": 6, 
                "aqi": "yes", # air quality
                "alerts": "no" # alerts
            }

            response = await client.get(url, params=params)
            if response.status_code != 200:
                # error try
                error_msg = f"Failed to fetch data from WeatherAPI. Status: {response.status_code}"
                try:
                    error_data = response.json()
                    if "error" in error_data:
                        error_msg += f". API Error: {error_data['error'].get('message', 'Unknown error')}"
                except:
                    pass # Ignore if not parse json
                raise HTTPException(status_code=500, detail=error_msg)

            data = response.json()
            return data
    except httpx.TimeoutException:
        raise HTTPException(status_code=500, detail="Timeout when fetching data from WeatherAPI")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error when fetching data from WeatherAPI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error fetching data from WeatherAPI: {str(e)}")


def process_weatherapi_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process raw data from WeatherAPI into the format expected by the frontend.
    """
    try:
        location = raw_data["location"]
        current = raw_data["current"]
        forecast_list = raw_data["forecast"]["forecastday"]

        # --- Process Current Weather Data ---
        city_name = location["name"]
        country = location["country"]
        latitude = location["lat"]
        longitude = location["lon"]
        temperature = current["temp_c"]
        humidity = current["humidity"]
        wind_speed_mph = current["wind_mph"]
        # metrics convertion
        wind_speed = wind_speed_mph * 0.44704 # 1 mph = 0.44704 m/s
        weather_desc = current["condition"]["text"]

        # --- Calculate IQV Components (simplified logic, same as before) ---
        temp_iqv = max(0, min(10, (30 - abs(temperature - 22)) / 3))  # Ideal around 22°C
        humidity_iqv = max(0, min(10, (100 - humidity) / 5))  # Lower humidity is better
        wind_iqv = max(0, min(10, (15 - wind_speed) / 1.5))  # Lower wind is better
        overall_iqv = (temp_iqv + humidity_iqv + wind_iqv) / 3

        # --- Process Forecast Data (5 days) ---
        processed_forecast: List[Dict[str, Any]] = []
        # Pula o primeiro dia se for o dia atual, pega os próximos 5
        # WeatherAPI inclui o dia atual no forecast, então pegamos os primeiros 5 items
        for day_data in forecast_list[:5]: 
            day_info = day_data["day"]
            # Usando o meio-dia como ponto de previsão representativo do dia
            # A API retorna dados agregados por dia, então pegamos os valores do 'day' object
            processed_forecast.append({
                "datetime": day_data["date"], # YYYY-MM-DD
                "temperature": day_info["avgtemp_c"],
                "humidity": day_info["avghumidity"],
                "wind_speed": day_info["maxwind_mph"] * 0.44704, # Convert to m/s
                "description": day_info["condition"]["text"],
                "icon": day_info["condition"]["icon"] # Pode ser usado pelo frontend
            })

        # --- Return Combined Data ---
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
            # Forecast data to be used by frontend
            "forecast": processed_forecast,
            # Campos para dados enriquecidos (GeoNames/WorldBank) - mantidos para compatibilidade
            "state": None, # Será preenchido por fetch_enriched_city_data
            "population": None, # Será preenchido por fetch_enriched_city_data
            "hdi": None, # Será preenchido por fetch_enriched_city_data
            "hdi_year": None # Será preenchido por fetch_enriched_city_data
        }
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Error processing WeatherAPI data: Missing key {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing WeatherAPI data: {str(e)}")


# Função para buscar dados enriquecidos (GeoNames, WorldBank) - mantida como estava
# (Certifique-se de que esta função esteja implementada corretamente como nas versões anteriores)
# async def fetch_enriched_city_data(city_name: str, country_code: str) -> dict: ...


# Função principal que orquestra a obtenção dos dados IQV
async def get_iqv_data(city: str) -> Dict[str, Any]:
    """
    Fetch IQV data for a given city using WeatherAPI.
    Includes enriched data from GeoNames and World Bank.
    """
    try:
        # 1. Get data from WeatherAPI (current + forecast)
        raw_weather_data = await get_current_weather_and_forecast(city)
        
        # 2. Process data into the expected format
        processed_data = process_weatherapi_data(raw_weather_data)
        
        # 3. Get enriched data (GeoNames, WorldBank) - mantém a lógica existente
        # Precisamos do country code para o WorldBank
        country_code = raw_weather_data["location"].get("country", "")[:2].upper() # Simplificação: pega os 2 primeiros chars e coloca em maiúsculo
        # Para GeoNames, podemos usar o nome da cidade e o country code
        enriched_data = await fetch_enriched_city_data(city, country_code)

        # 4. Merge enriched data into the final response
        processed_data.update({
            "state": enriched_data.get("state"),
            "population": enriched_data.get("population"),
            "hdi": enriched_data.get("hdi"),
            "hdi_year": enriched_data.get("hdi_year")
        })

        return processed_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing IQV data: {str(e)}")

# --- Função fetch_enriched_city_data (mantida ou copiada de versões anteriores) ---
# Certifique-se de que esta função existe e está correta.
# Aqui está um esboço baseado nas versões anteriores:
import httpx
from urllib.parse import quote
from typing import Dict, Any, Optional, Union

GEONAMES_USERNAME = os.getenv("GEONAMES_USERNAME", "demo") # Fallback para "demo"
WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2"

async def fetch_enriched_city_data(city_name: str, country_code: str) -> dict:
    """
    Fetch additional city data using GeoNames and World Bank.
    Returns a dictionary with 'state', 'population', 'hdi', 'hdi_year'.
    """
    enriched_data: Dict[str, Union[str, int, float, None]] = {
        "state": None,
        "population": None,
        "hdi": None,
        "hdi_year": None
    }

    # --- 1. Fetch data from GeoNames ---
    if not GEONAMES_USERNAME or GEONAMES_USERNAME == "demo":
        print("Warning: GEONAMES_USERNAME not set or using 'demo'. Some data may be unavailable.")
        
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
            population_str = geoname.get("population")
            if population_str:
                try:
                    enriched_data["population"] = int(population_str)
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert population '{population_str}' to integer for {city_name}.")
                    pass

    except httpx.TimeoutException:
        print(f"Timeout error fetching data from GeoNames for {city_name}")
    except httpx.RequestError as e:
        print(f"Request error fetching data from GeoNames for {city_name}: {e}")
    except Exception as e:
        print(f"Unexpected error fetching data from GeoNames for {city_name}: {e}")

    # --- 2. Fetch HDI from World Bank ---
    if country_code:
        try:
            indicator_code = "SP.HUM.IDX"
            wb_url = f"{WORLD_BANK_BASE_URL}/country/{country_code}/indicator/{indicator_code}"
            wb_params = {
                "format": "json",
                "per_page": "5",
                "date": "2010:2030"
            }
            async with httpx.AsyncClient() as client:
                wb_response = await client.get(wb_url, params=wb_params, timeout=10.0)
            
            if wb_response.status_code != 200:
                 print(f"World Bank error: {wb_response.status_code} - {wb_response.text}")
            
            wb_response.raise_for_status()
            wb_data = wb_response.json()

            if len(wb_data) > 1 and isinstance(wb_data[1], list):
                for entry in wb_data[1]:
                    if entry and entry.get("value") is not None:
                        try:
                            enriched_data["hdi"] = float(entry["value"])
                            enriched_data["hdi_year"] = int(entry["date"])
                            break
                        except (ValueError, TypeError) as e:
                            print(f"Error converting HDI: {e}")
                            continue
                if enriched_data["hdi"] is None:
                    print("No valid HDI value found in World Bank response.")
            else:
                 print("Unexpected World Bank response format or missing data.")

        except httpx.TimeoutException:
            print(f"Timeout error fetching HDI from World Bank for {country_code}")
        except httpx.RequestError as e:
            print(f"Request error fetching HDI from World Bank for {country_code}: {e}")
        except Exception as e:
            print(f"Unexpected error fetching HDI from World Bank for {country_code}: {e}")
    else:
        print(f"Warning: Empty country_code for {city_name}. Unable to fetch HDI from World Bank.")

    return enriched_data