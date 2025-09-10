from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Get API key from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise RuntimeError("OPENWEATHER_API_KEY is required")

@router.get("/api/health")
async def health_check():
    return {
        "message": "🌍 City Sense API is online!",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": [
            "/api/iqv?city=São%20Paulo",
            "/api/forecast?city=São%20Paulo",
            "/api/predict/iqv?city=São%20Paulo"
        ]
    }

@router.get("/api/debug")
async def debug_info(request: Request):
    return {
        "client_host": request.client.host,
        "headers": dict(request.headers),
        "api_key_available": bool(OPENWEATHER_API_KEY)
    }

@router.get("/")
async def root():
    return {"message": "🌍 City Sense API - Documentação em /docs"}