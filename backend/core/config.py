import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings configuration"""
    
    # API Settings
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Validation 
    def validate(self):
        if not self.OPENWEATHER_API_KEY:
            print("Warning: OPENWEATHER_API_KEY is not set")

settings = Settings()