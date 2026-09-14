from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, SQLModel
from database import engine, get_session
import models
from auth import verify_firebase_token
from pydantic import BaseModel

# Create database tables
SQLModel.metadata.create_all(engine)

app = FastAPI(title="RefundBoy API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://robiulsunnyemon.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to RefundBoy Backend"}

@app.post("/api/auth/login")
def login_user(decoded_token: dict = Depends(verify_firebase_token), db: Session = Depends(get_session)):
    """
    Called by frontend after successful Firebase login.
    Verifies token, then creates or fetches the user in the PostgreSQL database.
    """
    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "")
    picture = decoded_token.get("picture", "")

    if not uid:
        raise HTTPException(status_code=400, detail="Token missing UID")

    # Check if user exists using SQLModel select
    statement = select(models.User).where(models.User.firebase_uid == uid)
    user = db.exec(statement).first()

    if not user:
        # Create new user
        user = models.User(
            firebase_uid=uid,
            email=email,
            full_name=name,
            profile_pic=picture
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "profile_pic": user.profile_pic
        }
    }
