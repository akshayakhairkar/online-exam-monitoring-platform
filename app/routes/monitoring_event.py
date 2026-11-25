from datetime import datetime, timedelta, timezone
from typing import cast

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_id, get_current_candidate_id
from app.database.database import get_db
from app.models.exam_session import ExamSession
from app.models.monitoring_event import MonitoringEvent
from app.schemas.monitoring_event import (
    MonitoringEventCreate,
    MonitoringEventResponse,
    SessionMonitoringReport,
)
from app.services.integrity_analysis import (
    EVENT_COOLDOWN_SECONDS,
    EVENT_PENALTIES,
    calculate_integrity_score,
)

router = APIRouter(prefix="/sessions", tags=["Monitoring Events"])


@router.post(
    "/{session_id}/events",
    response_model=MonitoringEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_event(
    session_id: int,
    payload: MonitoringEventCreate,
    db: Session = Depends(get_db),
    current_candidate_id: int = Depends(get_current_candidate_id),
):
    session = cast(
        ExamSession | None,
        db.query(ExamSession).filter(
            ExamSession.id == session_id,
            ExamSession.candidate_id == current_candidate_id,
        ).first(),
    )

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if cast(str, session.status) != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Events can only be recorded for an in-progress session.",
        )

    cutoff = datetime.now(timezone.utc) - timedelta(
        seconds=EVENT_COOLDOWN_SECONDS
    )
    recent_event = (
        db.query(MonitoringEvent)
        .filter(
            MonitoringEvent.session_id == session_id,
            MonitoringEvent.event_type == payload.event_type,
            MonitoringEvent.occurred_at >= cutoff,
        )
        .order_by(MonitoringEvent.occurred_at.desc())
        .first()
    )
    if recent_event is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"This event type was recorded recently. "
                f"Wait {EVENT_COOLDOWN_SECONDS} seconds before retrying."
            ),
            headers={"Retry-After": str(EVENT_COOLDOWN_SECONDS)},
        )

    event = MonitoringEvent(
        session_id=session_id,
        event_type=payload.event_type,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get(
    "/{session_id}/events",
    response_model=list[MonitoringEventResponse],
    dependencies=[Depends(get_current_admin_id)],
)
def list_session_events(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = cast(
        ExamSession | None,
        db.query(ExamSession).filter(
            ExamSession.id == session_id
        ).first(),
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return (
        db.query(MonitoringEvent)
        .filter(MonitoringEvent.session_id == session_id)
        .order_by(
            MonitoringEvent.occurred_at.desc(),
            MonitoringEvent.id.desc(),
        )
        .limit(100)
        .all()
    )


@router.get(
    "/{session_id}/report",
    response_model=SessionMonitoringReport,
    dependencies=[Depends(get_current_admin_id)],
)
def get_session_report(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = db.query(ExamSession).filter(
        ExamSession.id == session_id
    ).first()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    events = (
        db.query(MonitoringEvent)
        .filter(MonitoringEvent.session_id == session_id)
        .order_by(
            MonitoringEvent.occurred_at.desc(),
            MonitoringEvent.id.desc(),
        )
        .all()
    )
    event_counts = {event_type: 0 for event_type in EVENT_PENALTIES}
    for event in events:
        event_type = cast(str, event.event_type)
        event_counts[event_type] = event_counts.get(event_type, 0) + 1

    integrity_score, score_penalties = calculate_integrity_score(event_counts)
    return {
        "session_id": session.id,
        "session_status": session.status,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "total_events": len(events),
        "event_counts": event_counts,
        "integrity_score": integrity_score,
        "score_penalties": score_penalties,
        "events": events,
    }