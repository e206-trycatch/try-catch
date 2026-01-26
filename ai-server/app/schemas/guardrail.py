"""가드레일 검증 결과 스키마 정의"""
from typing import Optional
from pydantic import BaseModel, Field


class GuardrailResult(BaseModel):
    """가드레일 검증 결과"""

    is_direct: bool = Field(..., description="정답을 직접 요구하는 질문인지 여부")
    is_irrelevant: bool = Field(..., description="프레임워크/문제와 무관한 질문인지 여부")
    is_safe: bool = Field(..., description="안전한 질문인지 여부 (욕설/비속어 없음)")
    reason: Optional[str] = Field(None, description="위반 사유")
    passed: bool = Field(..., description="전체 검증 통과 여부")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "is_direct": False,
                    "is_irrelevant": False,
                    "is_safe": True,
                    "reason": None,
                    "passed": True
                },
                {
                    "is_direct": True,
                    "is_irrelevant": False,
                    "is_safe": True,
                    "reason": "정답 코드를 직접 요구하는 질문입니다.",
                    "passed": False
                }
            ]
        }
    }
