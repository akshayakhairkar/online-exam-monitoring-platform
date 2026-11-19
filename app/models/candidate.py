
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class Candidate(Base):

    # Database table name
    __tablename__ = "candidates"

    # Unique candidate ID
    id = Column(Integer, primary_key=True, index=True)

    # Candidate name
    name = Column(String(100), nullable=False)

    # Candidate email
    email = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    # Securely hashed password
    password_hash = Column(String(255), nullable=False)

    # Candidate photograph location
    photo_path = Column(String(255), nullable=True)

    # Registration timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
