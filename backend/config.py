"""
config.py — Single Source of Truth for all settings
=====================================================

Flow:
    .env file
        └── loaded by pydantic-settings (BaseSettings)
                └── settings object
                        └── imported everywhere in the project
                                  from backend.config import settings

Security rules:
  • .env is in .gitignore — NEVER committed
  • .env.example is committed (placeholder values only)
  • No secret is ever hard-coded here
  • Access secrets ONLY via the `settings` object
"""

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    All values are read from the .env file automatically.
    The order of precedence is:
        OS environment variable  >  .env file  >  default value here
    """

    # ------------------------------------------------------------------
    # MongoDB
    # ------------------------------------------------------------------
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "outreach_db"

    # ------------------------------------------------------------------
    # Groq AI  (https://console.groq.com — free tier available)
    # ------------------------------------------------------------------
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # ------------------------------------------------------------------
    # Pinecone  (optional — vector lead similarity search)
    # ------------------------------------------------------------------
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "leads-index"

    # ------------------------------------------------------------------
    # Throttling / safety controls
    # ------------------------------------------------------------------
    THROTTLE_RATE: int = 10    # max sends inside the window
    THROTTLE_WINDOW: int = 60  # sliding window in seconds

    # ------------------------------------------------------------------
    # App
    # ------------------------------------------------------------------
    APP_NAME: str = "AI Outreach Engine"
    DEBUG: bool = True

    # ------------------------------------------------------------------
    # Pydantic-settings v2 config (replaces inner class Config)
    # ------------------------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",          # look for .env in the working directory
        env_file_encoding="utf-8",
        extra="ignore",           # silently ignore unknown keys in .env
        case_sensitive=False,     # GROQ_API_KEY == groq_api_key
    )

    # ------------------------------------------------------------------
    # Validators
    # ------------------------------------------------------------------
    @field_validator("GROQ_API_KEY", mode="before")
    @classmethod
    def warn_if_no_groq_key(cls, v: str) -> str:
        if not v or v == "your_groq_api_key_here":
            print(
                "\n⚠️  GROQ_API_KEY is not set. "
                "AI features will use rule-based fallbacks.\n"
                "   Get a free key at https://console.groq.com\n"
            )
        return v

    @field_validator("THROTTLE_RATE", mode="before")
    @classmethod
    def throttle_rate_must_be_positive(cls, v: int) -> int:
        if int(v) < 1:
            raise ValueError("THROTTLE_RATE must be >= 1")
        return int(v)

    @field_validator("THROTTLE_WINDOW", mode="before")
    @classmethod
    def throttle_window_must_be_positive(cls, v: int) -> int:
        if int(v) < 1:
            raise ValueError("THROTTLE_WINDOW must be >= 1")
        return int(v)

    # ------------------------------------------------------------------
    # Convenience helpers (not from .env — derived at runtime)
    # ------------------------------------------------------------------
    @property
    def groq_enabled(self) -> bool:
        """True only when a real Groq key is present."""
        return bool(self.GROQ_API_KEY) and self.GROQ_API_KEY != "your_groq_api_key_here"

    @property
    def pinecone_enabled(self) -> bool:
        """True only when Pinecone credentials are present."""
        return bool(self.PINECONE_API_KEY)


# One import → access everything:
#   from backend.config import settings
#   print(settings.GROQ_API_KEY)
settings = Settings()
