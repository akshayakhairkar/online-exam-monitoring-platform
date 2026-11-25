import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt
from pwdlib import PasswordHash

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidate import Candidate
from app.models.admin import Admin

# ---------------------------------------------------------------------------
# Configuration & Environment Variables
# ---------------------------------------------------------------------------
# Load environment variables from the .env file in the project root
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY must be set to a value of at least 32 characters.")

# Algorithm used to sign the token
ALGORITHM = "HS256"

# Token validity duration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Initialize password hashing with recommended settings (Argon2id)
password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Password Functions
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    """
    Takes a raw password string and converts it into a secure, salted hash
    to store safely in the candidate database.
    """
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies if a candidate's submitted plain text password matches
    the stored hash during login.
    """
    return password_hash.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# Token Functions
# ---------------------------------------------------------------------------
def create_access_token(user_id: int, role: str = "candidate") -> str:
    """
    Generates a signed JWT.
    - 'sub': unique user ID
    - 'role': 'candidate' or 'admin'
    - 'exp': expiration timestamp
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(user_id),
        "role": role,          # <-- role added here
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_candidate_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> int:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        candidate_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise unauthorized

    if payload.get("role") != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate access required",
        )

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate is None:
        raise unauthorized

    return candidate_id






def get_current_admin_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> int:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        admin_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise unauthorized

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin is None:
        raise unauthorized

    return admin_id