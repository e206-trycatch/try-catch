"""API 라우터"""

from fastapi import APIRouter, HTTPException
from openai import AuthenticationError, RateLimitError, APITimeoutError, APIError
import httpx

from app.schemas import HintRequest, HintResponse
from app.services.guardrail import guardrail_service
from app.services.hint_generator import hint_generator_service
from app.services.backend_client import backend_client
from app.config import settings

router = APIRouter(prefix="/api/v1", tags=["hint"])


@router.post("/hint", response_model=HintResponse)
async def generate_hint(request: HintRequest):
    """
    사용자 질문에 대한 힌트 생성 (가드레일 → 사용자 코드 조회 → 힌트 생성)

    Args:
        request: 힌트 요청 정보 (백엔드 서버로부터 수신)

    Returns:
        HintResponse: 힌트 응답 (성공 시 힌트, 실패 시 거절 메시지)
    """
    try:
        # ============================================
        # Step 1: 가드레일 검증
        # ============================================
        guardrail_result = await guardrail_service.validate_question(
            user_question=request.user_question,
            framework=request.framework,
            problem_description=request.problem_description
        )

        # 가드레일 검증 실패 시 거절 메시지 반환
        if not guardrail_result.passed:
            rejection_messages = {
                "is_direct": "정답을 직접 알려드릴 수 없습니다. 스스로 해결할 수 있도록 힌트를 드릴게요.",
                "is_irrelevant": "코딩/디버깅과 관련 없는 질문입니다. 코드 관련 질문을 해주세요.",
                "is_safe": "부적절한 표현이 포함되어 있습니다. 질문을 다시 작성해주세요."
            }

            # 위반 사유에 따른 메시지 선택
            if guardrail_result.is_direct:
                rejection_reason = rejection_messages["is_direct"]
            elif guardrail_result.is_irrelevant:
                rejection_reason = rejection_messages["is_irrelevant"]
            elif not guardrail_result.is_safe:
                rejection_reason = rejection_messages["is_safe"]
            else:
                rejection_reason = guardrail_result.reason or "질문이 적절하지 않습니다."

            return HintResponse(
                success=False,
                hint=None,
                guardrail_passed=False,
                rejection_reason=rejection_reason
            )

        # ============================================
        # Step 2: 백엔드 서버로부터 사용자 코드 조회
        # ============================================
        user_code_context = None
        user_code_data = await backend_client.get_user_code(
            user_id=request.user_id,
            problem_id=request.problem_id
        )

        if user_code_data:
            user_code_context = user_code_data.current_code

        # ============================================
        # Step 3: 힌트 생성
        # ============================================
        hint = await hint_generator_service.generate_hint(
            framework=request.framework,
            problem_description=request.problem_description,
            user_question=request.user_question,
            user_code_context=user_code_context
        )

        return HintResponse(
            success=True,
            hint=hint,
            guardrail_passed=True,
            rejection_reason=None
        )

    except AuthenticationError as e:
        # LLM API 인증 오류 (API 키 문제)
        print(f"LLM API 인증 오류: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요."
        )

    except RateLimitError as e:
        # LLM API 요청 한도 초과
        print(f"LLM API 요청 한도 초과: {str(e)}")
        raise HTTPException(
            status_code=429,
            detail="요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        )

    except APITimeoutError as e:
        # LLM API 응답 시간 초과
        print(f"LLM API 타임아웃: {str(e)}")
        raise HTTPException(
            status_code=504,
            detail="AI 서비스 응답 시간이 초과되었습니다. 다시 시도해주세요."
        )

    except APIError as e:
        # 기타 LLM API 오류
        print(f"LLM API 오류: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        )

    except httpx.RequestError as e:
        # 백엔드 서버 연결 실패
        print(f"백엔드 서버 연결 실패: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="백엔드 서버와 통신에 실패했습니다. 잠시 후 다시 시도해주세요."
        )

    except Exception as e:
        # 예상치 못한 오류 (최후의 폴백)
        print(f"힌트 생성 중 예외 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="힌트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        )


@router.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "guardrail_model": settings.guardrail_model,
        "hint_model": settings.hint_model,
        "backend_url": settings.backend_base_url
    }
