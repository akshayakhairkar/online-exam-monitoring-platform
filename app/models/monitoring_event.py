from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database.database import Base


class MonitoringEvent(Base):
    __tablename__ = "monitoring_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("exam_sessions.id"),
        nullable=False,
        index=True,
    )
    event_type = Column(String(40), nullable=False)
    occurred_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )