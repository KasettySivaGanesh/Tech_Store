from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Falls back to defaults suitable for local development.
    """

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/orders_db"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/orders_db"

    # Inter-service communication
    PRODUCT_SERVICE_URL: str = "http://localhost:5001"

    # Service identity
    SERVICE_NAME: str = "order-service"
    SERVICE_PORT: int = 5002

    # Logging
    LOG_LEVEL: str = "INFO"

    # Retry configuration
    PRODUCT_CLIENT_TIMEOUT: float = 5.0
    PRODUCT_CLIENT_RETRIES: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
