from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "message": "🌍 City Sense API está online!",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": [
            "/api/QoL?city=São%20Paulo",
            "/api/forecast?city=São%20Paulo",
            "/api/predict/QoL?city=São%20Paulo"
        ]
    }

@router.get("/api/debug")
async def debug_info(request: Request):
    """Debug information endpoint"""
    api_key = os.getenv("OPENWEATHER_API_KEY", "")
    client_host = request.client.host if request.client else "unknown"
    return {
        "client_host": client_host,
        "headers": dict(request.headers),
        "api_key_available": bool(api_key)
    }

@router.get("/")
async def root():
    """Root endpoint"""
    return {"message": "🌍 City Sense API - Documentation in /docs"}