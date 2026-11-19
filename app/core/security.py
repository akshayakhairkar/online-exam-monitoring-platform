import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt
from pwdlib import PasswordHash

# ---------------------------------------------------------------------------
# Configuration & Environment Variables
# ---------------------------------------------------------------------------
# Load environment variables from the .env file in the project root
load_dotenv()

# Secret key used for signing JWT tokens (loaded from .env)
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-dev")

# Algorithm used to sign the token
ALGORITHM = "HS256"

# Token validity duration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Initialize password hashing with recommended settings (Argon2id)
password_hash = PasswordHash.recommended()


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
def create_access_token(candidate_id: int) -> str:
    """
    Generates a cryptographically signed JWT access token.
    - 'sub' (subject): the unique candidate ID.
    - 'exp' (expiration): the UTC timestamp after which the token expires.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(candidate_id),
        "exp": expire
    }
    
    # Sign and encode the token using our secret key and HS256 algorithm
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


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