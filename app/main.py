from fastapi import FastAPI

# Database configuration and models
from app.database.database import Base, engine
from app.models.candidate import Candidate
from app.models.exam_session import ExamSession

# Route handlers
from app.routes.candidate import router as candidate_router
from app.routes.auth import router as auth_router
from app.routes.exam_session import router as session_router
from app.models.admin import Admin
from fastapi.middleware.cors import CORSMiddleware

from app.models.monitoring_event import MonitoringEvent
from app.routes.monitoring_event import router as monitoring_event_router
# ---------------------------------------------------------------------------
# FastAPI Application Setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Online Exam Monitoring & Integrity Analytics Platform",
    description="Online Exam Monitoring & Integrity Analytics Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------------------------------------------------
# Database Table Initialization
# ---------------------------------------------------------------------------
# Inspects all imported SQLAlchemy models and creates tables in SQLite if missing
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Router Registration
# ---------------------------------------------------------------------------
# Mount candidate registration routes (prefix: /candidates)
app.include_router(candidate_router)

# Mount authentication & login routes (prefix: /auth)
app.include_router(auth_router)
app.include_router(session_router)
app.include_router(monitoring_event_router)
# ---------------------------------------------------------------------------
# Root & Health Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def home():
    """Welcome endpoint to confirm API is running."""
    return {
        "message": "Welcome to ExamGuard",
        "status": "Running"
    }


@app.get("/health")
def health():
    """Health check endpoint for monitoring."""
    return {
        "status": "Healthy"
    }