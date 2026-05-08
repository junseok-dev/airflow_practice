from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import dashboard, programs, students


app = FastAPI(
    title="Trainee Competency Dashboard API",
    description="OULAD 기반 교육생 역량 대시보드용 FastAPI 서버",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(students.router, prefix="/api", tags=["students"])
app.include_router(programs.router, prefix="/api", tags=["programs"])
