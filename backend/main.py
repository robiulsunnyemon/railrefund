from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_firebase_token
from firebase_admin import firestore
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="RefundBoy API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://robiulsunnyemon.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore
db = firestore.client()

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to RefundBoy Backend (Firestore Edition)"}

@app.post("/api/auth/login")
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

    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        # Create new user in Firestore
        user_data = {
            "id": uid,
            "email": email,
            "full_name": name,
            "profile_pic": picture,
            "balance": 0.0
        }
        user_ref.set(user_data)
    else:
        user_data = user_doc.to_dict()

    return {
        "message": "Login successful",
        "user": user_data
    }

@app.get("/api/users", response_model=List[UserResponse])
def get_all_users():
    """
    Returns a list of all registered users from Firestore.
    """
    users_ref = db.collection("users")
    docs = users_ref.stream()
    
    users = []
    for doc in docs:
        data = doc.to_dict()
        users.append(UserResponse(**data))
        
    return users
