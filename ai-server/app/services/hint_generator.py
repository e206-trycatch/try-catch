"""힌트 생성 서비스"""

from typing import Literal, Optional
from openai import OpenAI
from app.config import settings
from app.prompts import get_hint_system_prompt


class HintGeneratorService:
    """힌트 생성 서비스 클래스"""

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.gms_api_key,
            base_url=settings.gms_base_url
        )
        self.model = settings.hint_model

    async def generate_hint(
        self,
        framework: Literal["django", "spring", "vue", "react", "fullstack"],
        problem_description: str,
        user_question: str,
        user_code_context: Optional[str] = None
    ) -> str:
        """
        프레임워크별 힌트 생성

        Args:
            framework: 선택한 프레임워크
            problem_description: 문제 설명 (DOC 파일 내용)
            user_question: 사용자 질문
            user_code_context(optional): 사용자가 현재까지 작성한 코드 (백엔드로부터 수신)

        Returns:
            str: 생성된 힌트 (한국어)
        """
        # 시스템 프롬프트 가져오기
        system_prompt = get_hint_system_prompt(framework)

        # 사용자 프롬프트 구성
        user_prompt = self._build_user_prompt(
            problem_description=problem_description,
            user_question=user_question,
            user_code_context=user_code_context
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                max_completion_tokens=4000  # 추론 모델은 reasoning + output 토큰 필요
            )

            content = response.choices[0].message.content

            if not content:
                raise Exception("힌트 생성 모델로부터 응답을 받지 못했습니다.")

            return content

        except Exception as e:
            print(f"힌트 생성 중 에러 발생: {str(e)}")
            raise Exception(f"힌트 생성 실패: {str(e)}")

    def _build_user_prompt(
        self,
        problem_description: str,
        user_question: str,
        user_code_context: Optional[str]
    ) -> str:
        """
        사용자 프롬프트 구성

        Args:
            problem_description: 문제 설명 (DOC 파일 내용)
            user_question: 사용자 질문
            user_code_context: 사용자 작성 코드

        Returns:
            str: 구성된 사용자 프롬프트
        """
        prompt_parts = [
            f"**문제 설명**:\n{problem_description}"
        ]

        # 사용자 작성 코드가 있으면 추가
        if user_code_context:
            prompt_parts.append(
                f"\n**사용자가 현재까지 작성한 코드**:\n```\n{user_code_context}\n```"
            )
        else:
            prompt_parts.append(
                "\n**사용자가 현재까지 작성한 코드**: (아직 작성하지 않음)"
            )

        # 사용자 질문 추가
        prompt_parts.append(f"\n**사용자 질문**:\n{user_question}")

        # 지침 추가
        prompt_parts.append(
            "\n---\n위 정보를 바탕으로 사용자가 스스로 문제를 해결할 수 있도록 힌트를 제공해주세요."
        )

        return "\n".join(prompt_parts)


# 싱글톤 인스턴스
hint_generator_service = HintGeneratorService()
