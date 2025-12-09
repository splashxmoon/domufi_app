import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):


    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_key: Optional[str] = os.getenv("API_KEY", None)


    supabase_url: str = os.getenv("SUPABASE_URL", "https://piterhtecxxktnxbldmz.supabase.co")
    supabase_key: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdGVyaHRlY3h4a3RueGJsZG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjA5MjEsImV4cCI6MjA2ODYzNjkyMX0.rEUfb2BFDiTdTOtalgtS519xSPH8GejBgQYGhQITly0")


    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")


    use_local_models: bool = os.getenv("USE_LOCAL_MODELS", "true").lower() == "true"
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    reasoning_model: str = os.getenv("REASONING_MODEL", "local")


    enable_learning: bool = os.getenv("ENABLE_LEARNING", "true").lower() == "true"
    learning_rate: float = float(os.getenv("LEARNING_RATE", "0.001"))
    max_memory_size: int = int(os.getenv("MAX_MEMORY_SIZE", "10000"))


    max_concurrent_requests: int = int(os.getenv("MAX_CONCURRENT_REQUESTS", "100"))
    request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    cache_ttl: int = int(os.getenv("CACHE_TTL", "3600"))

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
