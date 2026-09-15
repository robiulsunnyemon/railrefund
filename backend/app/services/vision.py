import base64
import httpx
import re
from fastapi import HTTPException
from app.core.config import settings

VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

async def extract_ticket_data_from_image(image_bytes: bytes) -> dict:
    """
    Sends image to Google Cloud Vision API and extracts text.
    Parses the text to find DB Ticket information.
    """
    if not settings.VISION_API_KEY:
        raise HTTPException(status_code=500, detail="Vision API key not configured")

    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    payload = {
        "requests": [
            {
                "image": {
                    "content": base64_image
                },
                "features": [
                    {
                        "type": "DOCUMENT_TEXT_DETECTION"
                    }
                ]
            }
        ]
    }
    
    params = {"key": settings.VISION_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(VISION_API_URL, params=params, json=payload, timeout=15.0)
        
    if response.status_code != 200:
        print("Vision API Error:", response.text)
        raise HTTPException(status_code=502, detail="Failed to analyze image with Google Cloud Vision")
        
    data = response.json()
    responses = data.get("requests", [])
    if not responses and not data.get("responses"):
        raise HTTPException(status_code=400, detail="No text found in image")
        
    text_annotations = data.get("responses", [])[0].get("textAnnotations", [])
    if not text_annotations:
        raise HTTPException(status_code=400, detail="Could not read text from ticket")
        
    full_text = text_annotations[0].get("description", "")
    print("Extracted Ticket Text:\n", full_text)
    
    # Very basic parsing logic for Deutsche Bahn tickets
    parsed_data = {
        "pnr": "UNKNOWN",
        "train_no": "ICE 0000",
        "departure_station": "Unknown",
        "arrival_station": "Unknown"
    }
    
    # 1. Look for PNR (Auftragsnummer or Booking code - usually 6 uppercase letters/numbers)
    # Often appears after "Auftragsnummer", "Auftrag", or "Buchungscode"
    pnr_match = re.search(r'(?:Auftragsnummer|Auftrag|Buchungscode|PNR)[\s:]*([A-Z0-9]{6})\b', full_text, re.IGNORECASE)
    if pnr_match:
        parsed_data["pnr"] = pnr_match.group(1).upper()
    else:
        # Fallback: Just find the first standalone 6-character uppercase alphanumeric string
        fallback_match = re.search(r'\b([A-Z0-9]{6})\b', full_text)
        if fallback_match:
            parsed_data["pnr"] = fallback_match.group(1).upper()
            
    # 2. Look for Train Number (ICE, IC, EC, RE followed by numbers)
    train_match = re.search(r'\b(ICE|IC|EC|RE|RB|S)\s*\d+\b', full_text)
    if train_match:
        parsed_data["train_no"] = train_match.group(0)
        
    # We could do more complex parsing for stations and dates, but this is a starting point.
    
    return parsed_data
