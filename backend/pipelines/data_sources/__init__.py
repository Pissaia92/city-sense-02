from .get_weather import get_weather_data
from .get_traffic import get_traffic_data
from .get_air_quality import get_air_quality_data
from .get_safety import get_safety_data

# Define o que será exportado com 'from data_sources import *'
__all__ = [
    "get_weather_data",
    "get_traffic_data",
    "get_air_quality_data",
    "get_safety_data"
]
