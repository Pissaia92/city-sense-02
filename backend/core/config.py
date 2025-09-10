import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings configuration"""
    
    # API Settings
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Validation - tornar opcional para evitar erro de inicialização
    def validate(self):
        if not self.OPENWEATHER_API_KEY:
            raise RuntimeError("OPENWEATHER_API_KEY is required")

settings = Settings()