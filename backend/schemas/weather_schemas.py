from pydantic import BaseModel, Field
from typing import List, Optional

class CityQuery(BaseModel):
    """City query parameters"""
    city: str = Field(..., description="City name", example="São Paulo")

class ForecastQuery(BaseModel):
    """Forecast query parameters"""
    city: str = Field(..., description="City name", example="Rio de Janeiro")

class PredictionQuery(BaseModel):
    """Prediction query parameters"""
    city: str = Field(..., description="City name", example="Brasília")

class SuggestionQuery(BaseModel):
    """Suggestion query parameters"""
    query: str = Field("", description="City name query", example="São")