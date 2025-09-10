from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timedelta
import sys
import os

# Adicionar o diretório atual ao path corretamente
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

# Importar usando caminho absoluto
import utils.weather_utils as weather_utils

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/api/ml/status")
async def ml_model_status():
    """Check ML model status"""
    return {
        "model_available": False,
        "last_training": None,
        "model_version": "0.1.0"
    }

@router.get("/api/predict/iqv")
@limiter.limit("10/minute")
async def predict_iqv(
    request: Request,
    city: str = Query(..., description="City name", example="Brasília")
):
    """Predict future IQV for a city (placeholder implementation)"""
    try:
        # Get city coordinates
        city_data = await weather_utils.get_city_coordinates(city)
        lat, lon = city_data["lat"], city_data["lon"]
        
        # Generate predictions for next 7 days
        predictions = []
        base_date = datetime.now()
        
        for i in range(7):
            date = base_date + timedelta(days=i)
            # Simulate some variation in predictions
            base_iqv = 75.0 - (i * 2)  # Gradually decreasing
            variation = (i % 3) * 5  # Small variations
            
            prediction = {
                "date": date.strftime("%Y-%m-%d"),
                "predicted_iqv": max(0, min(100, base_iqv + variation)),
                "confidence": max(0.5, 1.0 - (i * 0.1))  # Decreasing confidence
            }
            predictions.append(prediction)
        
        # Create response
        response = {
            "city": city_data["name"],
            "country": city_data["country"],
            "latitude": lat,
            "longitude": lon,
            "predictions": predictions,
            "model_info": {
                "version": "0.1.0",
                "last_updated": "2024-01-01"
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))