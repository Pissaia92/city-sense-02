from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize app
app = FastAPI(
    title="City Sense API",
    description="API for City Sense - Urban Quality of Life Index",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://city-sense.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers directly
import routers.main as main_router
import routers.weather as weather_router
import routers.ml as ml_router
import routers.suggestions as suggestions_router

# Include routers
app.include_router(main_router.router)
app.include_router(weather_router.router)
app.include_router(ml_router.router)
app.include_router(suggestions_router.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)