from pydantic_settings import BaseSettings
from typing import List
import os
from functools import lru_cache

class Settings(BaseSettings):
    DEBUG: bool = True
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:3000"
    COHERE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLAMA_CLOUD_API_KEY: str = ""
    DATABASE_URL: str = ""
    MONGODB_URL: str = ""
    MYSQL_URL: str = ""
    SECRET_KEY: str = "your-secret-key"

    @property
    def allowed_hosts_list(self) -> List[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 