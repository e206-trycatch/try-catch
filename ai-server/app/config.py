from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # OpenAI API 설정
    gms_api_key: str
    gms_base_url: str = "https://gms.ssafy.io/gmsapi/api.openai.com/v1"

    # AI 모델 설정
    guardrail_model: str = "gpt-5-mini"  # 가드레일 모델
    hint_model: str = "gpt-5-mini"  # 힌트 생성 모델

    # 백엔드 서버 연동 설정
    backend_base_url: str = "http://localhost:8080"  # Spring Boot 백엔드 서버 URL
    backend_api_token: str = ""  # 백엔드 서버 인증 토큰

    # 애플리케이션 설정
    app_title: str = "ErrorScape AI Server"
    app_version: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
