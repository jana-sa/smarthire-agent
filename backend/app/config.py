from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"
    similarity_weight: float = 0.6
    rule_weight: float = 0.4
    max_file_size_mb: int = 10
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    database_url: str = "sqlite:///smarthire.db"
    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_expire_minutes: int = 1440

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
