from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class MonitoringEventCreate(BaseModel):
    event_type: Literal[
        "TAB_HIDDEN",
        "WINDOW_BLUR",
        "FACE_MISSING",
        "CAMERA_UNAVAILABLE",
    ]


class MonitoringEventResponse(BaseModel):
    id: int
    session_id: int
    event_type: str
    occurred_at: datetime

    class Config:
        from_attributes = True


class SessionMonitoringReport(BaseModel):
    session_id: int
    session_status: str
    start_time: datetime | None
    end_time: datetime | None
    total_events: int
    event_counts: dict[str, int]
    integrity_score: int
    score_penalties: dict[str, int]
    events: list[MonitoringEventResponse]