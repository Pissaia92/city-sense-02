import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from typing import Dict, Any
from datetime import datetime
import logging
import unicodedata
from contextlib import asynccontextmanager

# --- Configuração de Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Importações do Projeto ---
# Importa o DataProcessor do local correto
try:
    from pipelines.data_processor import DataProcessor
    PIPELINE_AVAILABLE = True
    logger.info("✅ Módulo DataProcessor importado com sucesso.")
except ImportError as e:
    logger.error(f"❌ Erro ao importar DataProcessor: {e}")
    PIPELINE_AVAILABLE = False
    DataProcessor = None

# --- Funções Auxiliares ---
def normalize_city_name(city: str) -> str:
    """
    Remove acentos e normaliza o nome da cidade.
    Ex: 'São Paulo' -> 'Sao Paulo'
    """
    if not isinstance(city, str):
        return "Unknown"
    normalized = unicodedata.normalize('NFD', city)
    ascii_city = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_city.strip()

# --- Inicialização da Aplicação FastAPI ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando City Sense API...")
    # Aqui é possível carregar modelos, conectar ao banco, etc.
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

# --- Endpoints da API ---
@app.get("/", include_in_schema=False)
async def root():
    """Endpoint raiz com informações básicas da API."""
    return {
        "message": "🌍 City Sense API está online!",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": [
            "/api/predict/iqv?city=São%20Paulo",
        ]
    }

@app.get("/api/health", tags=["Sistema"])
async def health_check():
    """Endpoint de verificação de saúde da API."""
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
    
    - **city**: Nome da cidade (ex: São Paulo, Rio de Janeiro).
    """
    if not PIPELINE_AVAILABLE or DataProcessor is None:
        logger.error("Pipeline de dados não está disponível.")
        raise HTTPException(status_code=500, detail="Serviço de processamento de dados não disponível.")
    
    if not city or not isinstance(city, str):
        raise HTTPException(status_code=400, detail="Parâmetro 'city' é obrigatório e deve ser uma string.")
        
    try:
        # Normaliza o nome da cidade
        city_normalized = normalize_city_name(city)
        logger.info(f"🔍 Solicitação de previsão de IQV para: {city_normalized}")

        # --- Processo de Previsão ---
        # Instancia o DataProcessor
        processor = DataProcessor(city=city_normalized)
        
        # Executa o pipeline completo
        result = processor.process()
        
        if not result:
            logger.error("❌ O pipeline não retornou dados processados.")
            raise HTTPException(status_code=500, detail="Falha ao processar os dados.")
            
        logger.info(f"✅ Previsão de IQV concluída para {city_normalized}.")
        return result

    except FileNotFoundError as fnf_error:
        logger.warning(f"⚠️ Dados não encontrados para a cidade '{city}': {fnf_error}")
        raise HTTPException(status_code=404, detail=f"Dados para a cidade '{city}' não encontrados.")
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao prever IQV para '{city}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar a solicitação para '{city}'.")

# --- Ponto de Entrada da Aplicação ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Para desenvolvimento, use reload=True. Para produção, remova ou defina como False.
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
