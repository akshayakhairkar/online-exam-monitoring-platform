
from pydantic import BaseModel, EmailStr, Field


# Schema for candidate registration
class CandidateCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )
