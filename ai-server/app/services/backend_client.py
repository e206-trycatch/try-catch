"""백엔드 서버 통신 클라이언트"""

import httpx
from typing import Optional
from app.config import settings
from app.schemas import UserCodeContext


class BackendClient:
    """백엔드 서버와 통신하는 클라이언트"""

    def __init__(self):
        self.base_url = settings.backend_base_url
        self.api_token = settings.backend_api_token
        self.timeout = 10.0  # 10초 타임아웃

    async def get_user_code(self, user_id: str, problem_id: str) -> Optional[UserCodeContext]:
        """
        백엔드 서버로부터 사용자의 현재 작성 코드 조회

        Args:
            user_id: 사용자 ID
            problem_id: 문제 ID

        Returns:
            UserCodeContext: 사용자 코드 컨텍스트 또는 None (실패 시)
        """
        url = f"{self.base_url}/api/v1/user-code/{user_id}/{problem_id}"
        headers = {}

        # API 토큰이 설정된 경우 헤더에 추가
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()

                data = response.json()
                return UserCodeContext(**data)

        except httpx.HTTPStatusError as e:
            print(f"백엔드 서버 HTTP 에러: {e.response.status_code} - {e.response.text}")
            return None

        except httpx.RequestError as e:
            print(f"백엔드 서버 연결 실패: {str(e)}")
            return None

        except Exception as e:
            print(f"사용자 코드 조회 중 예외 발생: {str(e)}")
            return None


# 싱글톤 인스턴스
backend_client = BackendClient()
