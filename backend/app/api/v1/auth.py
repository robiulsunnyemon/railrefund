from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_firebase_token
from app.db.database import get_db
from datetime import datetime, timezone

router = APIRouter()

@router.post("/login")
def login_user(decoded_token: dict = Depends(verify_firebase_token)):
    """
    Called by frontend after successful Firebase login.
    Verifies token, then creates or fetches the user in Firestore.
    """
    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "")
    picture = decoded_token.get("picture", "")

    if not uid:
        raise HTTPException(status_code=400, detail="Token missing UID")

    db = get_db()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        # Create new user in Firestore
        user_data = {
            "id": uid,
            "email": email,
            "full_name": name,
            "profile_pic": picture,
            "balance": 0.0,
            "iban_no": "",
            "status": "ACTIVE",
            "subscription_plan": "FREE",
            "subscription_status": "ACTIVE",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        user_ref.set(user_data)
    else:
        user_data = user_doc.to_dict()

    return {
        "message": "Login successful",
        "user": user_data
    }
