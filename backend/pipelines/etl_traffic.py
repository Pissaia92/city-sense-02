# backend/pipelines/etl_traffic.py
import os
import requests
import pandas as pd
from datetime import datetime
from pathlib import Path

# Diretório de dados
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "traffic_data.parquet"

# Substitua pela sua chave da Google Maps
GOOGLE_MAPS_API_KEY = "AIzaSyATVS2nG6GHem1e_C581bNJp1Z526QCqs4"

# Rotas de exemplo em São Paulo
ROUTES = [
    {"origin": "Avenida Paulista, São Paulo", "destination": "Aeroporto de Congonhas, São Paulo"},
    {"origin": "Av. Brigadeiro Faria Lima, São Paulo", "destination": "Barra da Tijuca, Rio de Janeiro"},
    {"origin": "Praça da Sé, São Paulo", "destination": "Morumbi, São Paulo"}
]

def fetch_traffic_data():
    """Busca dados de trânsito para rotas pré-definidas."""
    traffic_data = []
    
    for route in ROUTES:
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": route["origin"],
            "destination": route["destination"],
            "departure_time": "now",
            "traffic_model": "best_guess",
            "key": GOOGLE_MAPS_API_KEY
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data["status"] == "OK":
            leg = data["routes"][0]["legs"][0]
            traffic_data.append({
                "origin": route["origin"],
                "destination": route["destination"],
                "duration": leg["duration"]["value"],  # em segundos
                "duration_in_traffic": leg["duration_in_traffic"]["value"],  # em segundos
                "delay": leg["duration_in_traffic"]["value"] - leg["duration"]["value"],  # atraso em segundos
                "timestamp": datetime.now().isoformat()
            })
    
    return traffic_data

def save_traffic_data(data):
    """Salva dados de trânsito em Parquet."""
    df = pd.DataFrame(data)
    df.to_parquet(INPUT_FILE, index=False)

def run_traffic_etl():
    """Pipeline completo de ETL para trânsito."""
    try:
        data = fetch_traffic_data()
        save_traffic_data(data)
        return {"status": "success", "routes_processed": len(data)}
    except Exception as e:
        return {"status": "error", "message": str(e)}