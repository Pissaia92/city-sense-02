from fastapi import APIRouter, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Common cities for suggestions
COMMON_CITIES = [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza",
    "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre",
    "New York", "London", "Tokyo", "Paris", "Berlin",
    "Los Angeles", "Chicago", "Miami", "Toronto", "Madrid"
]

@router.get("/api/suggestions")
@limiter.limit("60/minute")
async def get_city_suggestions(
    request: Request,
    query: str = Query("", description="City name query", example="São")
):
    """Get city suggestions based on query"""
    if not query:
        # Return popular cities
        return {"suggestions": COMMON_CITIES[:10]}
    
    # Filter cities based on query
    query_lower = query.lower()
    suggestions = [city for city in COMMON_CITIES if query_lower in city.lower()]
    
    return {"suggestions": suggestions[:10]}