from prefect import flow, task
import requests
import pandas as pd
from datetime import datetime
import os
import pathlib


API_KEY = "639a55afc4ce8c41a27ae30d387af052" 

# Diretório de dados relativo ao script
CURRENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # D:\city-sense\backend
DATA_DIR = os.path.join(CURRENT_DIR, "data")
FILEPATH = os.path.join(DATA_DIR, "weather_data.parquet")

@task
def fetch_weather_data(city="São Paulo"):
    url = f"http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric",
        "lang": "pt_br"
    }
    response = requests.get(url, params=params)
    response.raise_for_status() 
    return response.json()

@task
def process_weather_data(raw_data):
    processed = {
        "city": raw_data["name"],
        "temperature": raw_data["main"]["temp"],
        "feels_like": raw_data["main"]["feels_like"],
        "humidity": raw_data["main"]["humidity"],
        "description": raw_data["weather"][0]["description"],
        "timestamp": datetime.now().isoformat()
    }
    return processed

DATA_DIR = pathlib.Path(__file__).parent.parent / "data"

@task
def save_to_parquet(data, filepath=DATA_DIR / "weather_data.parquet"):
    os.makedirs(DATA_DIR, exist_ok=True)
    df = pd.DataFrame([data])
    df.to_parquet(filepath, index=False)
    print(f"Dados salvos em {filepath}") 

@flow(name="ETL - Clima São Paulo")
def etl_weather_flow():
    raw = fetch_weather_data()
    processed = process_weather_data(raw)
    save_to_parquet(processed)
    return processed

if __name__ == "__main__":
    etl_weather_flow()
