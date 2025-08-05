# backend/main.py
import os
from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Callable, Union, Awaitable, Optional
from datetime import datetime
import logging
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

# =============== CONFIGURAÇÃO DO RATE LIMITING ===============
# Vamos remover o slowapi por problemas de compatibilidade e usar uma abordagem mais simples
RATE_LIMITING_ENABLED = False  # Desativado por enquanto devido a problemas com Pydantic v2

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
         tags=["IQV"])
async def get_iqv(city: str):
    logger.info(f"Recebida solicitação para cidade: {city}")
    try:
        # Normaliza o nome da cidade
        city_normalized = normalize_city_name(city)
        logger.info(f"Cidade normalizada: {city_normalized}")
        # Importar o serviço aqui para evitar problemas de importação circular
        from services.weather_service import get_weather_data
        # Obter dados climáticos
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
            "latitude": weather_data["latitude"],  
            "longitude": weather_data["longitude"],  
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
         tags=["Previsão"])
async def get_forecast(city: str):
    """
    Endpoint para obter a previsão climática para uma cidade específica.
    """
    logger.info(f"Recebida solicitação de previsão para cidade: {city}")
    try:
        city_normalized = normalize_city_name(city)
        logger.info(f"Cidade normalizada: {city_normalized}")        
        from services.weather_service import get_forecast_data
        # Obter dados de previsão
        forecast_data = get_forecast_data(city_normalized)
              
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
        "environment": "development" if os.getenv("ENVIRONMENT") != "production" else "production"
    }

@app.get("/api/predict/iqv", 
         summary="Prevê o Índice de Qualidade de Vida",
         description="Retorna uma previsão do IQV para uma cidade específica com base em dados históricos e modelo de machine learning.",
         response_description="Previsão do IQV calculado",
         tags=["IQV"])
async def predict_iqv(city: str):
    """
    Endpoint para obter uma previsão do Índice de Qualidade de Vida (IQV) para uma cidade específica.
    """
    logger.info(f"Recebida solicitação de previsão para cidade: {city}")
    try:
        # Normaliza o nome da cidade
        city_normalized = normalize_city_name(city)
        logger.info(f"Cidade normalizada: {city_normalized}")
        # Processa os dados com o pipeline
        from pipelines.data_processing import DataPipeline
        pipeline = DataPipeline(city_normalized)
        # Executa o pipeline completo
        processed_data = pipeline.process()
        # Prepara a resposta
        result = {
            "city": processed_data['city'],
            "predicted_iqv": processed_data['predicted_iqv'],
            "current_temperature": processed_data['temperature'],
            "current_humidity": processed_data['humidity'],
            "current_traffic_delay": processed_data['traffic_delay'],
            "timestamp": processed_data['timestamp']
        }
        logger.info(f"Previsão gerada para {city}: {result}")
        return result
    except Exception as e:
        logger.error(f"Erro ao gerar previsão para {city}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao processar a previsão"
        )

@app.get("/api/ml/status",
         summary="Verifica o status do sistema de machine learning",
         description="Retorna informações sobre o estado atual do modelo de machine learning.",
         response_description="Status do sistema ML",
         tags=["Sistema"])
async def ml_status():
    """Endpoint para verificar o status do sistema de machine learning"""
    try:
        from pipelines.data_processing import DataPipeline
        pipeline = DataPipeline("São Paulo")  # Cidade de exemplo
        model_available = pipeline.predictor.is_model_available()
        return {
            "ml_system": "active" if model_available else "inactive",
            "model_available": model_available,
            "model_path": pipeline.predictor.model_path,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erro ao verificar status do ML: {str(e)}")
        return {
            "ml_system": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)