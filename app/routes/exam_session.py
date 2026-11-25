from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_candidate_id
from app.database.database import get_db
from app.models.exam_session import ExamSession
from app.schemas.exam_session import SessionResponse

router = APIRouter(
    prefix="/sessions",
    tags=["Exam Sessions"]
)


def _get_candidate_session(
    session_id: int,
    candidate_id: int,
    db: Session,
) -> ExamSession:
    session = db.query(ExamSession).filter(
        ExamSession.id == session_id,
        ExamSession.candidate_id == candidate_id,
    ).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


# 1. Start Exam Session
@router.post("/start", response_model=SessionResponse)
def start_session(
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    # Prevent starting multiple simultaneous active sessions
    active_session = db.query(ExamSession).filter(
        ExamSession.candidate_id == current_candidate_id,
        ExamSession.status.in_(["IN_PROGRESS", "PAUSED"])
    ).first()
    if active_session:
        raise HTTPException(
            status_code=400,
            detail=f"Candidate already has an active session (Session ID: {active_session.id}, Status: {active_session.status})"
        )

    # Create new session
    new_session = ExamSession(
        candidate_id=current_candidate_id,
        status="IN_PROGRESS",
        start_time=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


# 2. Pause Exam Session
@router.post("/{session_id}/pause", response_model=SessionResponse)
def pause_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    session = _get_candidate_session(session_id, current_candidate_id, db)

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
def resume_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    session = _get_candidate_session(session_id, current_candidate_id, db)

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
def submit_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    session = _get_candidate_session(session_id, current_candidate_id, db)

    if session.status == "SUBMITTED":
        raise HTTPException(status_code=400, detail="Session is already submitted.")

    session.status = "SUBMITTED"
    session.end_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


# 5. Get Session Details
@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    return _get_candidate_session(session_id, current_candidate_id, db)