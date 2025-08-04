# backend/main.py
import os
from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Callable, Union, Awaitable, Optional
from datetime import datetime
import logging
import requests
import unicodedata

def normalize_city_name(city: str) -> str:
    """
    Remove acentos e normaliza o nome da cidade para compatibilidade com APIs externas.
    Ex: 'São Paulo' -> 'Sao Paulo'
    """
    # Normaliza para forma NFD e remove os diacríticos
    normalized = unicodedata.normalize('NFD', city)
    ascii_city = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_city.strip()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Carlos' City Sense API",
    description="API para cálculo do Índice de Qualidade de Vida Urbana (IQV) com dados climáticos e de trânsito",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "IQV",
            "description": "Endpoints relacionados ao cálculo do Índice de Qualidade de Vida"
        },
        {
            "name": "Previsão",
            "description": "Endpoints relacionados à previsão climática"
        },
        {
            "name": "Sistema",
            "description": "Endpoints de saúde e diagnóstico do sistema"
        }
    ]
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SLOWAPI_AVAILABLE = False  # ← Defina aqui, antes do try
limiter = None

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    
    limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    
    @app.exception_handler(RateLimitExceeded)
    async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return Response(
            content='{"detail": "Limite de requisições excedido. Tente novamente mais tarde."}',
            status_code=429,
            media_type="application/json"
        )
    
    SLOWAPI_AVAILABLE = True 
    logger.info("slowapi configurado com sucesso - rate limiting ativado")
    
except ImportError as e:
    logger.warning(f"slowapi não está disponível: {str(e)}. Rate limiting desativado.")
    SLOWAPI_AVAILABLE = False  

# =============== FUNÇÕES E ENDPOINTS ===============
def calculate_iqv(temperature: float, humidity: float, traffic_delay: float = 0) -> Dict[str, float]:
    """
    Calcula o Índice de Qualidade de Vida (IQV) com base nos dados climáticos e de trânsito.
    """
    # Cálculo do IQV Clima (baseado em temperatura)
    temp_score = max(0, min(10, 10 - abs(temperature - 22.5) / 2.5))
    
    # Cálculo do IQV Umidade (ideal: 40-60%)
    humidity_score = max(0, min(10, 10 - abs(humidity - 50) / 5))
    
    # Cálculo do IQV Trânsito (ideal: 0 minutos de atraso)
    traffic_score = max(0, min(10, 10 - traffic_delay / 3))
    
    # Cálculo do IQV Tendência 
    trend_score = 5 + (22.5 - temperature) / 5
    
    # Cálculo do IQV Geral (média ponderada)
    iqv_overall = (
        temp_score * 0.3 + 
        humidity_score * 0.2 + 
        traffic_score * 0.3 + 
        trend_score * 0.2
    )
    
    return {
        "iqv_climate": round(temp_score, 2),
        "iqv_humidity": round(humidity_score, 2),
        "iqv_traffic": round(traffic_score, 2),
        "iqv_trend": round(trend_score, 2),
        "iqv_overall": round(iqv_overall, 2)
    }

@app.get("/api/iqv", 
         summary="Calcula o Índice de Qualidade de Vida Urbana",
         description="Retorna o Índice de Qualidade de Vida (IQV) para uma cidade específica, "
                     "considerando temperatura, umidade, trânsito e tendências climáticas.",
         response_description="Dados do IQV calculados com sucesso",
         tags=["IQV"],)
         

async def get_iqv(city: str):
    logger.info(f"Recebida solicitação para cidade: {city}")
    
    # Normaliza o nome da cidade
    city_normalized = normalize_city_name(city)
    logger.info(f"Cidade normalizada: {city_normalized}")
    
    try:
        from services.weather_service import get_weather_data
        weather_data = get_weather_data(city_normalized)
        
        # Simular dados de trânsito
        large_cities = ["São Paulo", "Rio de Janeiro", "New York", "London", "Tokyo"]
        avg_traffic_delay = 15.0 if weather_data["city"] in large_cities else 5.0
        
        # Calcular IQV
        iqv_data = calculate_iqv(
            temperature=weather_data["temperature"],
            humidity=weather_data["humidity"],
            traffic_delay=avg_traffic_delay
        )
        
        # Combinar todos os dados
        result = {
            "city": weather_data["city"],
            "country": weather_data["country"],
            "updated_at": weather_data["updated_at"],
            "temperature": weather_data["temperature"],
            "description": weather_data["description"],
            "humidity": weather_data["humidity"],
            "avg_traffic_delay_min": avg_traffic_delay,
            **iqv_data
        }
        
        logger.info(f"Dados retornados para {city}: {result}")
        return result
        
    except ValueError as ve:
        logger.warning(f"Erro de validação para {city}: {str(ve)}")
        raise HTTPException(
            status_code=404,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Erro inesperado ao processar {city}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao processar a solicitação"
        )

@app.get("/api/forecast",
         summary="Obtém a previsão climática para uma cidade",
         description="Retorna a previsão climática para os próximos 7 dias de uma cidade específica.",
         response_description="Previsão climática para os próximos 7 dias",
         tags=["Previsão"],)
         
async def get_forecast(city: str):
    """
    Endpoint para obter a previsão do tempo para uma cidade específica
    """
    logger.info(f"Recebida solicitação de previsão para cidade: {city}")

    city_normalized = normalize_city_name(city)
    logger.info(f"Cidade normalizada: {city_normalized}")
    
    try:
        # Importar o serviço aqui para evitar problemas de importação circular
        from services.weather_service import get_forecast_data
        
        # Obter dados de previsão
        forecast_data = get_forecast_data(city)
        
        return {"forecast": forecast_data}
        
    except ValueError as ve:
        logger.warning(f"Erro de validação para {city}: {str(ve)}")
        raise HTTPException(
            status_code=404,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Erro inesperado ao processar {city}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao processar a solicitação"
        )

@app.get("/api/debug",
         include_in_schema=False)
async def debug_env():
    """Endpoint temporário para verificar variáveis de ambiente"""
    # Tratamento seguro para OPENWEATHER_API_KEY
    api_key = os.getenv("OPENWEATHER_API_KEY")
    api_key_preview = f"{api_key[:5]}..." if api_key else "NOT SET"
    
    return {
        "OPENWEATHER_API_KEY_set": bool(api_key),
        "OPENWEATHER_API_KEY_preview": api_key_preview,
        "env_file_exists": os.path.exists(".env"),
        "current_dir": os.getcwd(),
        "env_contents": open(".env").read().strip() if os.path.exists(".env") else "NO .env FILE",
        "slowapi_available": SLOWAPI_AVAILABLE,
        "python_version": os.popen("python --version").read().strip()
    }

@app.get("/api/health",
         summary="Verifica a saúde da API",
         description="Endpoint para verificar se a API está funcionando corretamente.",
         response_description="Status de saúde da API",
         tags=["Sistema"])
async def health_check():
    """Endpoint de verificação de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_version": "1.0.0",
        "environment": "development" if os.getenv("ENVIRONMENT") != "production" else "production",
        "slowapi_available": SLOWAPI_AVAILABLE
    }
@app.get("/api/debug-query")
async def debug_query(city: str):
    return {
        "original_city": city,
        "normalized_city": normalize_city_name(city),
        "env_has_key": bool(os.getenv("OPENWEATHER_API_KEY")),
        "current_dir": os.getcwd()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)