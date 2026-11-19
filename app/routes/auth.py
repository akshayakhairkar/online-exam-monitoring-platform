from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidate import Candidate
from app.models.admin import Admin
from app.schemas.login import CandidateLogin
from app.schemas.admin import AdminLogin
from app.core.security import verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ------ Candidate Login ------
@router.post("/login")
def login_candidate(
    login_data: CandidateLogin,
    db: Session = Depends(get_db)
):
    # Find candidate by email
    candidate = db.query(Candidate).filter(
        Candidate.email == login_data.email
    ).first()

    # Verify candidate exists and password matches
    if not candidate or not verify_password(login_data.password, candidate.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Generate JWT with role = "candidate"
    access_token = create_access_token(candidate.id, role="candidate")

    return {
        "message": "Candidate login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "role": "candidate"
    }


# ------ Admin Login ------
@router.post("/admin-login")
def login_admin(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    # Find admin by username
    admin = db.query(Admin).filter(
        Admin.username == login_data.username
    ).first()

    # Verify admin exists and password matches
    if not admin or not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # Generate JWT with role = "admin"
    access_token = create_access_token(admin.id, role="admin")

    return {
        "message": "Admin login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "role": "admin"
    }