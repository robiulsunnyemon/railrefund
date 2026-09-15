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

@router.post("/", response_model=TicketResponse)
def create_ticket(ticket_data: TicketCreate, decoded_token: dict = Depends(verify_firebase_token)):
    """
    Takes a PNR/Booking Code, "finds" the ticket information (mocked),
    and saves it to the Firestore database under the current user.
    """
    uid = decoded_token.get("uid")
    db = get_db()
    
    # === MOCKING THE DB API FETCH ===
    # In a real-world scenario, you would call Deutsche Bahn's API here 
    # to fetch real details using `ticket_data.pnr`
    
    ticket_id = str(uuid.uuid4())
    
    new_ticket = {
        "id": ticket_id,
        "user_id": uid,
        "pnr": ticket_data.pnr.upper(),
        "train_no": "ICE 1004",  # Mocked
        "date": "15.09.2026",
        "departure_station": "Berlin Hbf",  # Mocked
        "arrival_station": "München Hbf",  # Mocked
        "departure_time": "10:30",
        "arrival_time": "14:45",
        "status": "TRACKING", # Initial status
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to Firestore in a 'tickets' collection
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
