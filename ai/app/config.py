from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Keys
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Redis Configuration
    redis_url: str = "redis://redis:6379"
    
    # Database Configuration
    database_url: Optional[str] = None
    
    # Service Configuration
    service_name: str = "ai-service"
    log_level: str = "INFO"
    
    # AI Model Configuration
    default_model: str = "gpt-3.5-turbo"
    max_tokens: int = 1000
    temperature: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
