
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate
from app.core.security import hash_password
from app.services.camera import capture_registration_photo

router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"]
)


@router.post("/register")
def register_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_candidate = db.query(Candidate).filter(
        Candidate.email == candidate.email
    ).first()

    if existing_candidate:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(candidate.password)

    # Create candidate object
    new_candidate = Candidate(
        name=candidate.name,
        email=candidate.email,
        password_hash=hashed_password
    )

    # Save candidate in database
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return {
        "message": "Candidate registered successfully",
        "candidate_id": new_candidate.id,
        "name": new_candidate.name,
        "email": new_candidate.email
    }


@router.post("/{candidate_id}/capture-photo")
def capture_candidate_photo(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    # 1. Verify candidate exists in SQLite
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    # 2. Trigger OpenCV camera capture
    photo_path = capture_registration_photo(candidate_id)

    if not photo_path:
        raise HTTPException(
            status_code=400,
            detail="Photo capture was cancelled by the user."
        )

    # 3. Update candidate's photo_path in the database
    candidate.photo_path = photo_path
    db.commit()
    db.refresh(candidate)

    return {
        "message": "Candidate photo captured successfully",
        "candidate_id": candidate.id,
        "photo_path": candidate.photo_path
    }