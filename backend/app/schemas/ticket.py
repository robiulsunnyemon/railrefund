from pydantic import BaseModel
from typing import Optional

class TicketCreate(BaseModel):
    pnr: str  # Booking code or PNR

class TicketResponse(BaseModel):
    id: str
    user_id: str
    pnr: str
    train_no: str
    date: str
    departure_station: str
    arrival_station: str
    departure_time: str
    arrival_time: str
    status: str
    created_at: str
