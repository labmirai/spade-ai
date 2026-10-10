import json
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    DEBUG: bool = True
    APP_NAME: str = "Spade AI Backend"
    API_VERSION: str = "v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    DATABASE_URL: str

    # JWT Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from environment variable"""
        if isinstance(self.CORS_ORIGINS, str):
            return json.loads(self.CORS_ORIGINS)
        return self.CORS_ORIGINS


settings = Settings()
