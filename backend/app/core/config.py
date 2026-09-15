from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RefundBoy API"
    API_V1_STR: str = "/api/v1"
    VISION_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
