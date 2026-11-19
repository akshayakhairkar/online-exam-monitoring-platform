from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.database import Base


class Admin(Base):
    __tablename__ = "admins"

    # Unique admin ID
    id = Column(Integer, primary_key=True, index=True)

    # Admin username (e.g., "invigilator1")
    username = Column(String(100), unique=True, nullable=False)

    # Securely hashed password
    password_hash = Column(String(255), nullable=False)

    # Record creation timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )