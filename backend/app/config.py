"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Saarthi Sentinel X"
    APP_ENV: str = "development"
    DEBUG: bool = True
    BACKEND_PORT: int = 8000
    BACKEND_HOST: str = "0.0.0.0"

    class Config:
        env_file = ".env"


settings = Settings()
