from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import router

app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
    description="ErrorScape AI 서버 - 가드레일 기반 프레임워크 특화 힌트 생성 시스템"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "ErrorScape AI Server",
        "version": settings.app_version,
        "description": "가드레일 기반 프레임워크 특화 힌트 생성 시스템",
        "guardrail_model": settings.guardrail_model,
        "hint_model": settings.hint_model,
        "supported_frameworks": ["django", "spring", "vue"]
    }
