from datetime import datetime
from pydantic import BaseModel


class SessionResponse(BaseModel):
    id: int
    candidate_id: int
    status: str
    start_time: datetime | None = None
    end_time: datetime | None = None

    class Config:
        from_attributes = True