# CLAUDE.md

## 프로젝트 개요
- **프로젝트명**: ErrorScape
- **설명**: 프레임워크 디버깅을 방탈출 테마를 통해 즐겁게 즐길 수 있도록 한다.
- **지원 프레임워크**: Django, Spring, Vue

## 기술 스택

### Frontend
- React 19, TypeScript, Vite
- Tailwind CSS, Zustand (상태관리)
- Monaco Editor, React Router

### AI Server
- Python, FastAPI
- OpenAI API, Pydantic

### Backend
- Spring Boot 3.5.9, Java 21
- Spring Security + JWT, JPA + MyBatis, MySQL, WebSocket

### Infra
- Docker Compose, Jenkins CI/CD

---

## Frontend 컨벤션

**Claude는 프론트엔드 코드 작성 시 아래 규칙을 반드시 준수해야 한다.**

### 설정 파일 경로
- ESLint: `frontend/eslint.config.js`
- Prettier: `frontend/.prettierrc`

### 파일/폴더 네이밍
| 대상 | 규칙 | 예시 |
|------|------|------|
| `.tsx` 파일 | PascalCase | `UserProfile.tsx` |
| `.ts` 파일 | camelCase | `useAuth.ts` |
| 폴더 (src 하위) | kebab-case | `user-profile/` |

### ESLint 규칙
- Import 자동 정렬 (`simple-import-sort`) - 빈 줄로 그룹 구분
- `any` 타입 금지 (error)
- 미사용 변수 경고 (warn)

### Prettier 규칙
- 작은따옴표 사용 (`'`)
- 세미콜론 필수 (`;`)
- 들여쓰기: 스페이스 2칸
- 줄 길이: 80자
- trailing comma: all (`[1, 2, 3,]`)

---

## AI Server 컨벤션

### 프로젝트 구조
```
ai-server/app/
├── config.py          # 설정
├── main.py            # FastAPI 진입점
├── routers.py         # API 라우터
├── schemas/           # Pydantic 스키마
├── services/          # 비즈니스 로직
└── prompts/           # 프롬프트 템플릿
```

### 네이밍
| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일/모듈 | snake_case | `hint_generator.py` |
| 클래스 | PascalCase | `HintGeneratorService` |
| 함수/변수 | snake_case | `generate_hint` |

### 코드 스타일
- 타입 힌트 필수
- Docstring 작성 (Args, Returns 포함)
- async/await 비동기 패턴
- 싱글톤: 모듈 레벨 인스턴스

---

## Learning Documentation Rule

코드 구현, 트러블슈팅, 디버깅 과정에서 활용한 지식을 [Learning.md](./Learning.md)에 자동으로 기록한다.

### 작성 원칙
- 30년차 시니어 개발자가 주니어에게 지식을 전수하는 관점으로 작성
- 서술형 줄글로 읽기 편하게 작성
- 단순 해결책 나열이 아닌, "왜 이렇게 동작하는지" 원리를 설명

### 포함 내용
- **코드 지식**: 언어/프레임워크의 동작 원리, 베스트 프랙티스
- **CS 지식**: 자료구조, 알고리즘, 네트워크, 운영체제 등 기반 개념
- **논리 구조**: 문제 접근 방식, 디버깅 사고 과정, 설계 판단 근거
- **도메인 지식**: 해당 비즈니스/기술 도메인의 맥락과 관례

### 작성 시점
- 주요 기능 구현 완료 시
- 버그 해결 완료 시
- 새로운 개념/패턴 적용 시
