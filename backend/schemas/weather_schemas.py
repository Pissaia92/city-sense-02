from pydantic import BaseModel, Field
from typing import Optional

class CityQuery(BaseModel):
    city: str = Field(..., description="City name", examples=["São Paulo"])

class ForecastQuery(BaseModel):
    city: str = Field(..., description="City name", examples=["Rio de Janeiro"])

class PredictionQuery(BaseModel):
    city: str = Field(..., description="City name", examples=["Brasília"])

class SuggestionQuery(BaseModel):
    query: str = Field(default="", description="City name query", examples=["São"])