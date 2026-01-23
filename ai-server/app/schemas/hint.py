"""힌트 요청/응답 스키마 정의"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Framework(str, Enum):
    """지원하는 프레임워크 종류"""
    DJANGO = "django"
    SPRING = "spring"
    VUE = "vue"


class HintRequest(BaseModel):
    """힌트 요청 스키마 (Backend → AI Server)"""
    user_id: str = Field(..., description="사용자 ID")
    problem_id: str = Field(..., description="문제 ID (problem_framework_id)")
    framework: Framework = Field(..., description="선택한 프레임워크 (django, spring, vue)")
    problem_description: str = Field(..., description="문제 설명 (DOC 파일 내용)")
    user_question: str = Field(..., description="사용자 질문")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_id": "user-123",
                    "problem_id": "1",
                    "framework": "spring",
                    "problem_description": "문제 설명 내용(md 파일)",
                    "user_question": "왜 userRepository가 null인가요?"
                }
            ]
        }
    }


class HintResponse(BaseModel):
    """힌트 응답 스키마 (AI Server → Backend)"""
    success: bool = Field(..., description="힌트 생성 성공 여부")
    hint: Optional[str] = Field(None, description="생성된 힌트 (가드레일 통과 시)")
    guardrail_passed: bool = Field(..., description="가드레일 통과 여부")
    rejection_reason: Optional[str] = Field(None, description="가드레일 거절 사유 (거절 시)")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "hint": "해당 클래스에 @Service나 @Component 어노테이션이 붙어있는지 확인해보세요.",
                    "guardrail_passed": True,
                    "rejection_reason": None
                },
                {
                    "success": False,
                    "hint": None,
                    "guardrail_passed": False,
                    "rejection_reason": "정답을 직접 알려드릴 수 없습니다. 스스로 해결할 수 있도록 힌트를 드릴게요."
                }
            ]
        }
    }
