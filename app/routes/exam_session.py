from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidate import Candidate
from app.models.exam_session import ExamSession
from app.schemas.exam_session import SessionStartRequest, SessionResponse

router = APIRouter(
    prefix="/sessions",
    tags=["Exam Sessions"]
)


# 1. Start Exam Session
@router.post("/start", response_model=SessionResponse)
def start_session(
    payload: SessionStartRequest,
    db: Session = Depends(get_db)
):
    # Verify candidate exists
    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Prevent starting multiple simultaneous active sessions
    active_session = db.query(ExamSession).filter(
        ExamSession.candidate_id == payload.candidate_id,
        ExamSession.status.in_(["IN_PROGRESS", "PAUSED"])
    ).first()
    if active_session:
        raise HTTPException(
            status_code=400,
            detail=f"Candidate already has an active session (Session ID: {active_session.id}, Status: {active_session.status})"
        )

    # Create new session
    new_session = ExamSession(
        candidate_id=payload.candidate_id,
        status="IN_PROGRESS",
        start_time=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


# 2. Pause Exam Session
@router.post("/{session_id}/pause", response_model=SessionResponse)
def pause_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot pause session in '{session.status}' status. Only 'IN_PROGRESS' sessions can be paused."
        )

    session.status = "PAUSED"
    db.commit()
    db.refresh(session)
    return session


# 3. Resume Exam Session
@router.post("/{session_id}/resume", response_model=SessionResponse)
def resume_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "PAUSED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot resume session in '{session.status}' status. Only 'PAUSED' sessions can be resumed."
        )

    session.status = "IN_PROGRESS"
    db.commit()
    db.refresh(session)
    return session


# 4. Submit Exam Session
@router.post("/{session_id}/submit", response_model=SessionResponse)
def submit_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status == "SUBMITTED":
        raise HTTPException(status_code=400, detail="Session is already submitted.")

    session.status = "SUBMITTED"
    session.end_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


# 5. Get Session Details
@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session