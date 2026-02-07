# E206_try-catch_공통프로젝트_포팅메뉴얼

# 목차

1. 사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전 (IDE 버전 포함)
2. 환경 변수 설정
3. DB 접속 정보 등 프로젝트(ERD)에 활용되는 주요 계정 및 프로퍼티가 정의된 파일 목록
4. DB 접속 정보 등 프로젝트(ERD)에 활용되는 주요 계정 및 프로퍼티가 정의된 파일 목록

# 1. **사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전 (IDE 버전 포함)**

공통/인프라 (Common / Infra)

| 구분 | 제품/버전 | 설정값/비고 |
| --- | --- | --- |
| OS | Ubuntu 24.04.3 LTS | Timezone: Etc/UTC, Locale: C.UTF-8 |
| 컨테이너 | Docker 29.1.5, Docker Compose 5.0.1 |  |
| 웹서버 | NGINX 1.24.0 |  |
| 데이터베이스 | MySQL 8.0.44, Redis 7.4.7 | MySQL(영구 데이터), Redis(캐시) |
| CI/CD | Jenkins 2.528.3 | develop 브랜치 push 시 자동 배포 |

백엔드 (Backend)

| 구분 | 제품/버전 | 설정값/비고 |
| --- | --- | --- |
| JVM | OpenJDK 21.0.9 | Dockerfile eclipse-temurin:21-jre 사용(빌드 전용) |
| WAS | Apache Tomcat 10.1.25 | Spring Boot 3.5.9 내장 |
| 프레임워크 | Spring Boot 3.5.9, Fast API 0.128.0 | Spring MVC, Security, Data JPA, WebSocket |
| 빌드 도구 | Gradle 8.14.3 |  |
| IDE | IntelliJ IDEA 2023.3.8 |  |
| Python | python:3.11-slim |  |

프론트엔드 (Frontend)

| 구분 | 제품/버전 | 설정값/비고 |
| --- | --- | --- |
| 런타임 | Node 20.19.0 |  |
| 패키지 매니저 | npm |  |
| 빌드 도구 | Vite 7.2.4 |  |
| 프레임워크 | React 19.2.0 |  |
| 상태/데이터 | Zustand 5.0.10 |  |
| 실시간 | WebSocket |  |
| 언어 | TypeScript ~5.9.3 |  |
| 스타일링 | Tailwindcss 4.1.18 |  |
| 에디터 | VSCode |  |

# 2. 환경 변수 설정

1. 프로젝트 루트 디렉토리에 있는 env.template 파일을 복사하여 .env 파일을 생성합니다
2. .env 파일을 편집하여 필요한 환경 변수를 설정합니다.

변경해야 하는 환경 변수

| 환경변수 | 설명 | 예시 값 |
| --- | --- | --- |
| MYSQL_ROOT_PASSWORD | MySQL 비밀번호 | 1234 |
| JWT_SECRET | JWT 키 | xMRkuw39LNcyyyBQmXWTeyKPbQXbUdbA/hlqNaOsom4= |
| GMS_API_KEY | GMS API 키 |  |
| GMS_BACK_BASE_URL | GMS URL | gms url을 넣고
/api.openai.com/v1/chat/completions |
| GMS_BASE_URL | GMS URL | gms url을 넣고  
/api.openai.com/v1 |
| MINIO_ROOT_USER | minio 유저 네임 | ssafy |
| MINIO_ROOT_PASSWORD | minio 비밀번호 | 1234 |
| MINIO_ENDPOINT | minio 엔드포인트 | 로컬용 : [http://localhost:8081](http://localhost:8081/)
배포용 : [http://trycatch-minio:9000](http://trycatch-minio:9000/) |
| FILE_BASE_URL | 도메인 사이트 url | 로컬용 : [http://localhost:8000](http://localhost:8000/)
배포용 : [https://i14e206.p.ssafy.io](https://i14e206.p.ssafy.io/) |
| AI_SERVER_URL | 내부 AI 서버 url | 로컬용 : [http://localhost:8000](http://localhost:8000/)
배포용 : [http://trycatch-ai:8000](http://trycatch-ai:8000/) |

# 3. 배포 시 특이사항

| 포트 번호 | 연결된 서버 |
| --- | --- |
| 80/tcp | Nginx 기반 프론트엔드 서비스 |
| 8080/tcp | 젠킨스 서버 |
| 8081/tcp | 백엔드 서버 |
| 3306/tcp | MySQL 서버 |
| 6379/tcp | Redis 서버 |
| 8000/tcp | 내부 Fast API AI 서버 |
| 9000/tcp | MinIO 서버 |
| 8085/tcp | MinIO GUI 서버 |

# 4. DB 접속 정보 등 프로젝트(ERD)에 활용되는 주요 계정 및 프로퍼티가 정의된 파일 목록

| 파일명 | 위치 | 내용 |
| --- | --- | --- |
| application.yml | /src/main/resources/ | MySQL, Redis, minio, AI, JWT 주요 프로퍼티 정의 |
| gradle.properties | 루트 | Gradle 빌드 옵션 및 일부 버전 정보 |