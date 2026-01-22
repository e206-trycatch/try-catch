"""헬스 체크 응답 스키마 정의"""
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """헬스 체크 응답 스키마"""
    status: str = Field(..., description="서버 상태", examples=["healthy"])
    guardrail_model: str = Field(..., description="가드레일 모델 이름")
    hint_model: str = Field(..., description="힌트 생성 모델 이름")
    backend_url: str = Field(..., description="연동된 백엔드 서버 URL")
