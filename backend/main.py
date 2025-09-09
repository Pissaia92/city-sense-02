import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from datetime import datetime
import logging
import unicodedata
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Project Imports ---
try:
    from pipelines.data_processor import DataProcessor
    PIPELINE_AVAILABLE = True
    logger.info("✅ DataProcessor module imported successfully.")
except ImportError as e:
    logger.error(f"❌ Error importing DataProcessor: {e}")
    PIPELINE_AVAILABLE = False
    DataProcessor = None # Initialize as None to handle the error gracefully

# --- Utility Functions ---
def normalize_city_name(city: str) -> str:
    if not isinstance(city, str):
        return "Unknown"
    normalized = unicodedata.normalize('NFD', city)
    ascii_city = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_city.strip()

# --- FastAPI Application Initialization ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting City Sense API...")
    # Here you could load models, connect to a database, etc.
    yield
    logger.info("🛑 Shutting down City Sense API...")

app = FastAPI(
    title="City Sense API",
    description="API for urban quality of life analysis and prediction.",
    version="2.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Predictions", "description": "Endpoints for quality of life predictions"},
        {"name": "System", "description": "System check endpoints"},
    ]
)

# --- CORS Configuration ---
# Allow all origins for development. Restrict in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- API Endpoints ---
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": "🌍 City Sense API is online!",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": ["/api/predict/iqv?city=Sao%20Paulo"],
    }

@app.get("/api/health", tags=["System"])
async def health_check():
    """API health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/api/predict/iqv", tags=["Predictions"])
async def predict_iqv(city: str = Query(..., description="Name of the city")):
    """
    Predicts the IQV (Quality of Life Index) for a given city.
    """
    if not PIPELINE_AVAILABLE or DataProcessor is None:  # DataProcessor is the CLASS, imported
        logger.error("❌ DataProcessor is not available.")
        raise HTTPException(
            status_code=500,
            detail="Internal server error: Data processing pipeline is not available."
        )
    try:
        logger.info(f"🔍 Processing IQV prediction for city: {city}")
        normalized_city = normalize_city_name(city)
        logger.info(f"📍 Normalized city name: {normalized_city}")

        processor = DataProcessor(city=normalized_city)
        # Call process() which does etl
        prediction_result = processor.process()
        
        if not prediction_result:
            logger.warning(f"⚠️ No data returned from processing pipeline for {normalized_city}")
            raise HTTPException(status_code=500, detail=f"Failed to process data for '{city}'.")

        logger.info(f"✅ IQV prediction successful for {normalized_city}")
        return prediction_result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing IQV prediction for {city}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while processing prediction for '{city}': {str(e)}"
        )

# This block allows running the app with `python main.py`
# For uvicorn, you would typically run `uvicorn main:app --reload`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)