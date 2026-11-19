
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Step 1: Create database location

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'examguard.db'}"


# Step 2: Create database engine

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Step 3: Create database session

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Step 4: Create base class

class Base(DeclarativeBase):
    pass


# Step 5: Database connection dependency

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
