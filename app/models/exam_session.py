
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class ExamSession(Base):

    __tablename__ = "exam_sessions"

    # Unique session ID
    id = Column(Integer, primary_key=True, index=True)

    # Connect session with candidate
    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False
    )

    # Examination status
    status = Column(
        String(20),
        default="NOT_STARTED",
        nullable=False
    )

    # Examination start time
    start_time = Column(DateTime(timezone=True), nullable=True)

    # Examination submission time
    end_time = Column(DateTime(timezone=True), nullable=True)

    # Session creation time
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
