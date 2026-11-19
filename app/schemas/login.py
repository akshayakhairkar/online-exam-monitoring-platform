
from pydantic import BaseModel, EmailStr


class CandidateLogin(BaseModel):

    email: EmailStr

    password: str
