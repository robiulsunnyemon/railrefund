from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.security import verify_firebase_token
from app.db.database import get_db
from app.schemas.ticket import TicketCreate, TicketResponse
from app.services.vision import extract_ticket_data_from_image
from datetime import datetime, timezone
import uuid

router = APIRouter()

@router.post("/scan", response_model=TicketResponse)
async def scan_ticket(
    file: UploadFile = File(...),
    decoded_token: dict = Depends(verify_firebase_token)
):
    """
    Accepts an image of a ticket, extracts text via Google Cloud Vision API,
    parses DB ticket details, and saves it to Firestore.
    """
    uid = decoded_token.get("uid")
    db = get_db()
    
    # Read image bytes
    image_bytes = await file.read()
    
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file provided")
        
    # Extract data using Vision API
    parsed_data = await extract_ticket_data_from_image(image_bytes)
    
    ticket_id = str(uuid.uuid4())
    
    new_ticket = {
        "id": ticket_id,
        "user_id": uid,
        "pnr": parsed_data.get("pnr", "NICHT GEFUNDEN"),
        "train_no": parsed_data.get("train_no", "NICHT GEFUNDEN"),
        "date": parsed_data.get("date", "Unbekannt"),
        "departure_station": parsed_data.get("departure_station", "Unbekannt"),
        "arrival_station": parsed_data.get("arrival_station", "Unbekannt"),
        "departure_time": parsed_data.get("departure_time", "Unbekannt"),
        "arrival_time": parsed_data.get("arrival_time", "Unbekannt"),
        "status": "TRACKING",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    db.collection("tickets").document(ticket_id).set(new_ticket)
    
    return new_ticket

@router.get("/", response_model=list[TicketResponse])
def get_user_tickets(decoded_token: dict = Depends(verify_firebase_token)):
    """
    Fetch all tracked tickets for the logged-in user.
    """
    uid = decoded_token.get("uid")
    db = get_db()
    
    tickets_ref = db.collection("tickets").where("user_id", "==", uid)
    docs = tickets_ref.stream()
    
    tickets = []
    for doc in docs:
        tickets.append(doc.to_dict())
        
    return tickets
