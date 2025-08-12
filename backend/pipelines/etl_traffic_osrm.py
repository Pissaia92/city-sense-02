import pandas as pd
from datetime import datetime
from pathlib import Path
import numpy as np

# Diretório de dados
DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "traffic_data.parquet"

# Rotas com nomes descritivos
ROUTES = [
    {
        "name": "Avenida Paulista → Aeroporto de Congonhas",
        "base_duration_min": 20  # Duração sem trânsito (em minutos)
    },
    {
        "name": "Av. Faria Lima → Barra da Tijuca",
        "base_duration_min": 60
    },
    {
        "name": "Praça da Sé → Morumbi",
        "base_duration_min": 25
    }
]

def generate_reliable_traffic_data():
    """Gera dados de trânsito simulados realistas."""
    traffic_data = []
    
    for route in ROUTES:
        base_duration_sec = route["base_duration_min"] * 60
        # Simula trânsito (atraso de 10% a 80%)
        delay_percent = np.random.uniform(0.1, 0.8)
        delay_sec = base_duration_sec * delay_percent
        duration_in_traffic_sec = base_duration_sec + delay_sec
        
        traffic_data.append({
            "origin": route["name"],
            "destination": "Destino",
            "duration": base_duration_sec,
            "duration_in_traffic": duration_in_traffic_sec,
            "delay": delay_sec,
            "timestamp": datetime.now().isoformat()
        })
    
    return traffic_data

def save_traffic_data(data):
    """Salva dados de trânsito em Parquet."""
    df = pd.DataFrame(data)
    df.to_parquet(INPUT_FILE, index=False)
    print(f"✅ Dados de trânsito salvos em {INPUT_FILE}")
    # Mostra um resumo
    print(df[["origin", "duration", "duration_in_traffic", "delay"]].round(0))

def run_traffic_etl():
    """Pipeline completo de ETL para trânsito."""
    try:
        data = generate_reliable_traffic_data()
        save_traffic_data(data)
        return {"status": "success", "routes_processed": len(data)}
    except Exception as e:
        print(f"❌ Erro no ETL de trânsito: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = run_traffic_etl()
    print(result)