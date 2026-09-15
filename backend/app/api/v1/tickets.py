from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_firebase_token
from app.db.database import get_db
from app.schemas.ticket import TicketCreate, TicketResponse
from datetime import datetime, timezone
import uuid

router = APIRouter()

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
        "departure_station": "Berlin Hbf",  # Mocked
        "arrival_station": "Munich Hbf",  # Mocked
        "departure_time": datetime.now(timezone.utc).isoformat(),
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
