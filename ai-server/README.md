# ErrorScape AI Server

> 가드레일 기반 프레임워크 특화 힌트 생성 시스템

ErrorScape 프로젝트의 AI 서버입니다. 사용자가 프레임워크(Django, Spring, Vue) 코드 디버깅 중 질문을 하면, **가드레일 검증** 후 **단계별 힌트**를 생성합니다.

---

## 핵심 기능

### 1. 가드레일 (Guardrail)
사용자 질문을 AI가 검증하여 부적절한 요청을 필터링합니다.

| 검증 항목 | 설명 | 거절 메시지 |
|-----------|------|-------------|
| 정답 직접 요구 | "정답 알려줘", "코드 보여줘" 등 | "정답을 직접 알려드릴 수 없습니다. 스스로 해결할 수 있도록 힌트를 드릴게요." |
| 관련 없는 질문 | 선택한 프레임워크/문제와 무관한 질문 | "현재 문제({framework})와 관련 없는 질문입니다." |
| 부적절한 표현 | 욕설, 비속어 등 | "부적절한 표현이 포함되어 있습니다." |

### 2. 힌트 생성 (Hint Generator)
가드레일 통과 시, 프레임워크별 전문가 프롬프트를 사용하여 **단계별 힌트**를 생성합니다.

- **정답 코드를 직접 제공하지 않음**
- 사용자가 **스스로 문제를 해결**할 수 있도록 유도
- 프레임워크별 특화된 힌트 제공 (Django, Spring, Vue)

### 3. 처리 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                         힌트 요청 처리 흐름                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Backend (Spring Boot)                                              │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  POST /api/v1/hint                                           │   │
│  │  (user_id, problem_id, framework, problem_description,       │   │
│  │   answer_code, error_message, user_question)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐                                               │
│  │ 1. 가드레일 검증 │ ── 실패 ──▶ { success: false,                │
│  │   (GPT 모델)     │              guardrail_passed: false,        │
│  └────────┬────────┘              rejection_reason: "..." }       │
│           │ 통과                                                    │
│           ▼                                                         │
│  ┌─────────────────────────────┐                                   │
│  │ 2. 사용자 코드 조회 (선택)   │                                   │
│  │   GET /api/v1/user-code/... │ ◀─── Backend (Spring Boot)       │
│  └────────┬────────────────────┘                                   │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │ 3. 힌트 생성    │ ── 성공 ──▶ { success: true,                  │
│  │   (GPT 모델)     │              guardrail_passed: true,         │
│  └─────────────────┘              hint: "단계별 힌트..." }         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API 명세

### 힌트 요청 API

| 항목 | 값 |
|------|-----|
| URL | `POST /api/v1/hint` |
| Content-Type | `application/json` |

# 아래 데이터 형식은 백엔드 팀원과 상의하여 다시 수정 필요함!!!!!!!!!!!!!!!!
#### Request Body
```json
{
  "user_id": "string (필수) - 사용자 ID",
  "problem_id": "string (필수) - 문제 ID",
  "framework": "django | spring | vue (필수)",
  "problem_description": "string (필수) - 문제 설명",
  "answer_code": "string (필수) - 정답 코드",
  "error_message": "string (선택) - 에러 메시지",
  "user_question": "string (필수) - 사용자 질문"
}
```

#### Response Body

**성공 시 (가드레일 통과):**
```json
{
  "success": true,
  "hint": "1. 먼저 해당 클래스에 @Service 어노테이션이 붙어있는지 확인해보세요.\n2. ...",
  "guardrail_passed": true,
  "rejection_reason": null
}
```

**가드레일 거절 시:**
```json
{
  "success": false,
  "hint": null,
  "guardrail_passed": false,
  "rejection_reason": "정답을 직접 알려드릴 수 없습니다. 스스로 해결할 수 있도록 힌트를 드릴게요."
}
```

### 헬스 체크 API

| 항목 | 값 |
|------|-----|
| URL | `GET /api/v1/health` |

#### Response
```json
{
  "status": "healthy",
  "guardrail_model": "gpt-5-mini",
  "hint_model": "gpt-5-mini",
  "backend_url": "http://localhost:8080"
}
```

---

## 폴더 구조

```
ai-server/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 앱 진입점, CORS 설정
│   ├── config.py            # 환경변수 설정 (pydantic-settings)
│   ├── routers.py           # API 엔드포인트 정의
│   │
│   ├── schemas/             # Pydantic 스키마 모듈
│   │   ├── __init__.py
│   │   ├── hint.py          # HintRequest, HintResponse, Framework
│   │   ├── user_code.py     # UserCodeContext
│   │   ├── health.py        # HealthResponse
│   │   └── guardrail.py     # GuardrailResult
│   │
│   ├── services/            # 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── guardrail.py     # 가드레일 검증 서비스 (GPT 호출)
│   │   ├── hint_generator.py # 힌트 생성 서비스 (GPT 호출)
│   │   └── backend_client.py # 백엔드 서버 HTTP 통신
│   │
│   └── prompts/             # AI 프롬프트 템플릿
│       ├── __init__.py
│       ├── guardrail_prompt.py  # 가드레일 시스템 프롬프트
│       └── hint_prompts.py      # 프레임워크별 힌트 프롬프트
│
├── .env.example             # 환경변수 예시
├── .gitignore
├── README.md
└── requirements.txt         # Python 의존성
```

### 주요 파일 역할

| 파일 | 역할 |
|------|------|
| `main.py` | FastAPI 앱 생성, CORS 미들웨어, 라우터 등록 |
| `config.py` | `.env` 파일에서 환경변수 로드 (API 키, 모델명, URL 등) |
| `routers.py` | `/api/v1/hint`, `/api/v1/health` 엔드포인트 구현 |
| `services/guardrail.py` | GPT로 질문 검증, 재시도 로직, JSON 파싱 |
| `services/hint_generator.py` | 프레임워크별 힌트 생성, 프롬프트 구성 |
| `services/backend_client.py` | httpx로 백엔드 서버 HTTP 요청 |
| `prompts/guardrail_prompt.py` | 가드레일 검증용 시스템 프롬프트 |
| `prompts/hint_prompts.py` | Django/Spring/Vue 전문가 프롬프트 |

---

## 환경 설정

### 환경 변수 (.env)

```bash
# OpenAI API 설정
GMS_API_KEY=your_api_key_here
GMS_BASE_URL=https://gms.ssafy.io/gmsapi/api.openai.com/v1

# AI 모델 설정
GUARDRAIL_MODEL=gpt-4o-mini    # 가드레일 검증용
HINT_MODEL=gpt-4o-mini         # 힌트 생성용

# 백엔드 서버 연동 (선택)
BACKEND_BASE_URL=http://localhost:8080
BACKEND_API_TOKEN=               # 인증 토큰 (없으면 비워둠)

# 앱 설정
APP_TITLE=ErrorScape AI Server
APP_VERSION=1.0.0
```

### 의존성

```
fastapi==0.128.0
uvicorn[standard]==0.40.0
openai==2.15.0
python-dotenv==1.2.1
pydantic==2.12.5
pydantic-settings==2.12.0
httpx==0.28.1
```

---

## 설치 및 실행

### 1. 가상환경 생성

```bash
cd ai-server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 GMS_API_KEY 등 설정
```

### 4. 서버 실행

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API 문서 확인

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 테스트

### curl 테스트

```bash
# 힌트 요청
curl -X POST http://localhost:8000/api/v1/hint \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "problem_id": "prob-001",
    "framework": "spring",
    "problem_description": "Spring Boot에서 @Autowired가 동작하지 않음",
    "answer_code": "@Service\npublic class UserService {\n    @Autowired\n    private UserRepository repo;\n}",
    "error_message": "NullPointerException",
    "user_question": "왜 userRepository가 null인가요?"
  }'

# 헬스 체크
curl http://localhost:8000/api/v1/health
```

---

## 백엔드 연동

AI 서버가 힌트 생성 시 사용자의 현재 코드를 참조하기 위해 백엔드 API를 호출합니다.

### 백엔드가 구현해야 하는 API

| 항목 | 값 |
|------|-----|
| URL | `GET /api/v1/user-code/{user_id}/{problem_id}` |

#### Response Body
```json
{
  "user_id": "string",
  "problem_id": "string",
  "current_code": "string - 사용자가 작성 중인 코드",
  "last_updated": "2026-01-22T15:30:00"
}
```

> **참고**: 이 API는 **선택 구현**입니다. 백엔드 연결 실패 시에도 힌트 생성은 정상 동작합니다.

---

## 지원 프레임워크

| 프레임워크 | 키워드 | 설명 |
|------------|--------|------|
| Django | `django` | Python 웹 프레임워크 |
| Spring | `spring` | Java/Spring Boot 프레임워크 |
| Vue | `vue` | Vue.js 프론트엔드 프레임워크 |
