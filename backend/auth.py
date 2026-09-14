import os
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

# Load Firebase credentials from a JSON file.
# The user will need to put their service account JSON file in backend/firebase-key.json
cred_path = os.path.join(os.path.dirname(__file__), "firebase-key.json")

try:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Could not initialize Firebase Admin SDK. {e}")
    # Initialize without credentials for now, will fail on actual verification if no key is provided later
    pass

security = HTTPBearer()

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
