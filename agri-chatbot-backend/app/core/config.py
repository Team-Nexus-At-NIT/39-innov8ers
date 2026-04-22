import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Agri AI Backend")
    ENV: str = os.getenv("ENV" , "development")
    
    # AI_MODE: str = os.getenv("AI_MODE", "dummy")
    AI_MODE: str = "dummy"
    CONFIDENCE_THRESHOLD: float = float(
        os.getenv("CONFIDENCE_THRESHOLD", 0.5)
    )

settings = Settings()