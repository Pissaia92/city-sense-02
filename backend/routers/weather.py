from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

import utils.weather_utils as weather_utils

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/api/QoL")
@limiter.limit("30/minute")
async def get_QoL_data_endpoint(
    request: Request,
    city: str = Query(..., description="City name", example="São Paulo")
):
    """
    Get QoL (Indice de Qualidade de Vida) data for a city.
    This endpoint now uses WeatherAPI and includes enriched data.
    """
    try:
        # call function WeatherAPI
        QoL_data = await weather_utils.get_QoL_data(city)
        return QoL_data
            
    except Exception as e:
        # generic error treatment
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/forecast")
@limiter.limit("30/minute")
async def get_forecast_data_endpoint(
    request: Request,
    city: str = Query(..., description="City name", example="Rio de Janeiro")
):
    """
    Get 5-day weather forecast for a city.
    Note: With WeatherAPI integration, forecast data is now included in /api/QoL.
    This endpoint might be deprecated or refactored.
    """
    try:
        full_data = await weather_utils.get_QoL_data(city)
        if "forecast" in full_data:
            return {
                "city": full_data["city"],
                "country": full_data["country"],
                "latitude": full_data["latitude"],
                "longitude": full_data["longitude"],
                "forecast": full_data["forecast"]
            }
        else:
            raise HTTPException(status_code=500, detail="Forecast data not available")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))