from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from dotenv import load_dotenv
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Load environment variables
load_dotenv()

# Initialize app and limiter
app = FastAPI(
    title="City Sense API",
    description="API for City Sense - Urban Quality of Life Index",
    version="1.0.0"
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://city-sense.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers using absolute imports
import routers.main as main_router
import routers.weather as weather_router
import routers.ml as ml_router
import routers.suggestions as suggestions_router

# Include routers
app.include_router(main_router.router)
app.include_router(weather_router.router)
app.include_router(ml_router.router)
app.include_router(suggestions_router.router)

# Get port from environment or default to 8000
port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)