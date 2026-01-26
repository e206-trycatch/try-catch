"""사용자 코드 컨텍스트 스키마 정의"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserCodeContext(BaseModel):
    """사용자 코드 컨텍스트 (Backend → AI Server 응답)"""
    user_id: str = Field(..., description="사용자 ID")
    problem_id: str = Field(..., description="문제 ID")
    current_code: str = Field(..., description="사용자가 현재까지 작성한 코드")
    last_updated: Optional[datetime] = Field(None, description="마지막 업데이트 시간")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_id": "user-123",
                    "problem_id": "prob-001",
                    "current_code": "public class UserService {\n    private UserRepository repo;\n}",
                    "last_updated": "2026-01-22T15:30:00"
                }
            ]
        }
    }
