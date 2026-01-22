"""가드레일 검증 서비스"""

import json
import asyncio
from typing import Optional
from openai import OpenAI
from app.config import settings
from app.schemas import GuardrailResult
from app.prompts import GUARDRAIL_SYSTEM_PROMPT


class GuardrailService:
    """가드레일 검증 서비스 클래스"""

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.gms_api_key,
            base_url=settings.gms_base_url
        )
        self.model = settings.guardrail_model
        self.max_retries = 2           # 최대 재시도 횟수
        self.retry_delay = 1.0         # 재시도 간 대기 시간 (초)

    async def validate_question(
        self,
        user_question: str,
        framework: str,
        problem_description: str
    ) -> GuardrailResult:
        """
        사용자 질문을 검증하는 가드레일 함수 (재시도 로직 포함)

        Args:
            user_question: 사용자가 입력한 질문
            framework: 선택한 프레임워크 (django, spring, vue)
            problem_description: 현재 문제 설명

        Returns:
            GuardrailResult: 검증 결과
        """
        # 사용자 프롬프트 구성
        user_prompt = f"""
**프레임워크**: {framework}
**문제 설명**: {problem_description}
**사용자 질문**: {user_question}

위 정보를 바탕으로 사용자 질문을 검증해주세요.
"""

        last_error: Optional[Exception] = None

        # 재시도 루프
        for attempt in range(self.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": GUARDRAIL_SYSTEM_PROMPT
                        },
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ],
                    max_completion_tokens=2000  # 추론 모델은 reasoning + output 토큰 필요
                )

                content = response.choices[0].message.content

                if not content:
                    raise Exception("가드레일 모델로부터 응답을 받지 못했습니다.")

                # JSON 파싱
                result_data = self._parse_json_response(content)

                # GuardrailResult 객체로 변환
                return GuardrailResult(**result_data)

            except Exception as e:
                last_error = e
                print(f"가드레일 검증 시도 {attempt + 1}/{self.max_retries} 실패: {str(e)}")

                # 마지막 시도가 아니면 대기 후 재시도
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))  # 지수 백오프

        # 모든 재시도 실패 시 거절 (Fail-Closed 정책)
        print(f"가드레일 검증 최종 실패: {str(last_error)}")
        return GuardrailResult(
            is_direct=False,
            is_irrelevant=False,
            is_safe=True,
            reason="시스템이 일시적으로 불안정합니다. 잠시 후 다시 질문해주세요.",
            passed=False
        )

    def _parse_json_response(self, content: str) -> dict:
        """
        LLM 응답에서 JSON을 파싱

        Args:
            content: LLM 응답 텍스트

        Returns:
            dict: 파싱된 JSON 데이터
        """
        try:
            # 코드 블록으로 감싸진 경우 제거
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            # JSON 파싱
            result = json.loads(content)
            return result

        except json.JSONDecodeError as e:
            print(f"JSON 파싱 에러: {str(e)}")
            print(f"원본 응답: {content}")
            raise Exception("가드레일 응답을 파싱할 수 없습니다.")


# 싱글톤 인스턴스
guardrail_service = GuardrailService()
