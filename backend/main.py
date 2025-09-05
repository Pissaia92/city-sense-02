# backend/main.py
import os
from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI, HTTPException
from typing import Dict, Any
from datetime import datetime
from pipelines import DataProcessor
import logging
import unicodedata
import asyncio
from contextlib import asynccontextmanager
import polars as pl

# --- Configuração de Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Importações do Projeto ---
try:
    processor = DataProcessor(city_normalized)
    processed_data = processor.process()
    PIPELINE_AVAILABLE = True
except ImportError as e:
    logger.error(f"❌ Erro ao importar DataProcessor: {e}")
    PIPELINE_AVAILABLE = False
    DataProcessor = None # Define como None para evitar NameError

# --- Inicialização da Aplicação FastAPI ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando City Sense API...")
    yield
    logger.info("🛑 Encerrando City Sense API...")

app = FastAPI(
    title="City Sense API",
    description="API para análise e previsão da qualidade de vida urbana.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Previsões", "description": "Endpoints para previsões de qualidade de vida"},
        {"name": "Sistema", "description": "Endpoints de verificação do sistema"},
    ]
)

# --- Funções Auxiliares ---
def normalize_city_name(city: str) -> str:
    """
    Remove acentos e normaliza o nome da cidade.
    Ex: 'São Paulo' -> 'Sao Paulo'
    """
    normalized = unicodedata.normalize('NFD', city)
    ascii_city = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_city

# --- Endpoints da API ---
@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "🌍 City Sense API está online!",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": ["/api/predict/iqv?city=São%20Paulo"]
    }

@app.get("/api/health", tags=["Sistema"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/api/predict/iqv", tags=["Previsões"])
async def predict_iqv(city: str):
    """
    Prevê o Índice de Qualidade de Vida (IQV) para uma cidade específica.
    """
    if not PIPELINE_AVAILABLE or DataProcessor is None:
        logger.error("Pipeline de dados não está disponível.")
        raise HTTPException(status_code=500, detail="Serviço de processamento de dados não disponível.")
    
    try:
        normalized_city = normalize_city_name(city)
        logger.info(f"🔍 Solicitação de previsão de IQV para: {normalized_city}")

        # Instancia o DataProcessor com um DataFrame vazio
        # O processor usará dados reais através dos stubs/ETLs
        dummy_df = pl.DataFrame()
        processor = DataProcessor(city=normalized_city, data=dummy_df)
        
        # Executa o pipeline completo
        result = processor.process()
        
        if not result:
            logger.error("❌ O pipeline não retornou dados processados.")
            raise HTTPException(status_code=500, detail="Falha ao processar os dados.")
            
        logger.info(f"✅ Previsão de IQV concluída para {normalized_city}.")
        return result

    except FileNotFoundError as fnf_error:
        logger.warning(f"⚠️ Dados não encontrados para a cidade '{city}': {fnf_error}")
        raise HTTPException(status_code=404, detail=f"Dados para a cidade '{city}' não encontrados.")
    except Exception as e:
        logger.error(f"❌ Erro ao prever IQV para '{city}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar a solicitação para '{city}'.")

# --- Ponto de Entrada da Aplicação ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
