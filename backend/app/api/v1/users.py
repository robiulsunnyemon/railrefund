from fastapi import APIRouter
from typing import List
from app.db.database import get_db
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_users():
    """
    Returns a list of all registered users from Firestore.
    """
    db = get_db()
    users_ref = db.collection("users")
    docs = users_ref.stream()
    
    users = []
    for doc in docs:
        data = doc.to_dict()
        users.append(UserResponse(**data))
        
    return users
