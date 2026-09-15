from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.database import get_db
from app.schemas.user import UserResponse, IbanUpdate, SubscriptionUpdate
from app.core.security import verify_firebase_token

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

@router.get("/me", response_model=UserResponse)
def get_current_user(decoded_token: dict = Depends(verify_firebase_token)):
    uid = decoded_token.get("uid")
    db = get_db()
    user_doc = db.collection("users").document(uid).get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(**user_doc.to_dict())

@router.put("/me/iban", response_model=UserResponse)
def update_iban(iban_data: IbanUpdate, decoded_token: dict = Depends(verify_firebase_token)):
    uid = decoded_token.get("uid")
    db = get_db()
    user_ref = db.collection("users").document(uid)
    
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_ref.update({"iban_no": iban_data.iban_no})
    return UserResponse(**user_ref.get().to_dict())

@router.put("/me/subscription", response_model=UserResponse)
def update_subscription(sub_data: SubscriptionUpdate, decoded_token: dict = Depends(verify_firebase_token)):
    uid = decoded_token.get("uid")
    db = get_db()
    user_ref = db.collection("users").document(uid)
    
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_ref.update({
        "subscription_plan": sub_data.plan.value,
        "subscription_status": "ACTIVE"
    })
    return UserResponse(**user_ref.get().to_dict())
