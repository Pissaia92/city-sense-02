# backend/ml/forecast_iqv.py
import os
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "weather_data.parquet"
OUTPUT_FILE = DATA_DIR / "forecast.parquet"

def load_data():
    """Carrega dados reais ou gera simulados se insuficientes."""
    if INPUT_FILE.exists():
        df = pd.read_parquet(INPUT_FILE)
        if len(df) >= 2:
            df = df[["timestamp", "temperature"]].rename(columns={"timestamp": "ds", "temperature": "y"})
            df["ds"] = pd.to_datetime(df["ds"])
            return df
    
    # Gera dados simulados se não houver dados suficientes
    print("⚠️  Dados insuficientes. Gerando dados simulados para demonstração.")
    end_date = datetime.now()
    dates = pd.date_range(end=end_date, periods=30, freq='D')
    temperature = 20 + 5 * np.sin(2 * np.pi * np.arange(30) / 365) + np.random.normal(0, 2, 30)
    
    return pd.DataFrame({"ds": dates, "y": temperature})

def train_and_forecast():
    """Treina modelo e gera previsão."""
    try:
        df = load_data()
        
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        model.fit(df)
        
        future = model.make_future_dataframe(periods=7)
        forecast = model.predict(future)
        
        return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]
    
    except Exception as e:
        raise RuntimeError(f"Erro no treinamento ou previsão: {e}")

def save_forecast(forecast):
    """Salva previsão em Parquet com formatação segura."""
    try:
        # Mantém ds como datetime para processamento
        forecast_df = forecast.copy()
        forecast_df["ds"] = pd.to_datetime(forecast_df["ds"])
        
        # Salva sem conversão para string
        forecast_df.to_parquet(OUTPUT_FILE, index=False)
    except Exception as e:
        raise IOError(f"Erro ao salvar previsão: {e}")

def run_forecast():
    """Pipeline completo de previsão."""
    try:
        forecast = train_and_forecast()
        save_forecast(forecast)
        return {
            "status": "success",
            "forecast_length": len(forecast),
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}