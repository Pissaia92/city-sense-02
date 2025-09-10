from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CityInfo(BaseModel):
    """City information model"""
    name: str
    country: str
    latitude: float
    longitude: float

class WeatherData(BaseModel):
    """Current weather data model"""
    temperature: float
    humidity: float
    wind_speed: float
    description: str
    icon: str

class IQVComponents(BaseModel):
    """IQV (Indice de Qualidade de Vida) components"""
    temperature: float
    humidity: float
    wind: float
    overall: float

class IQVData(BaseModel):
    """Complete IQV data model"""
    city: str
    country: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    iqv_components: IQVComponents
    timestamp: str

class ForecastPoint(BaseModel):
    """Forecast data point model"""
    datetime: str
    temperature: float
    humidity: float
    wind_speed: float
    description: str
    icon: str

class ForecastData(BaseModel):
    """Complete forecast data model"""
    city: str
    country: str
    latitude: float
    longitude: float
    forecast: List[ForecastPoint]

class PredictionData(BaseModel):
    """ML prediction data model"""
    date: str
    predicted_iqv: float
    confidence: float

class MLPredictionResponse(BaseModel):
    """Complete ML prediction response model"""
    city: str
    country: str
    latitude: float
    longitude: float
    predictions: List[PredictionData]
    model_info: dict