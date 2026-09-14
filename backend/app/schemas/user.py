from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    balance: Optional[float] = 0.0

class UserCreate(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    balance: float = 0.0
