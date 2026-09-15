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
    
    # Advanced parsing logic for Deutsche Bahn tickets (in German)
    parsed_data = {
        "pnr": "NICHT GEFUNDEN",
        "train_no": "NICHT GEFUNDEN",
        "departure_station": "Unbekannt",
        "arrival_station": "Unbekannt",
        "date": "Unbekannt",
        "departure_time": "Unbekannt",
        "arrival_time": "Unbekannt"
    }
    
    # 1. PNR (Auftragsnummer / Buchungscode) - 6 alphanumeric characters
    pnr_match = re.search(r'(?:Auftragsnummer|Auftrag|Buchungscode|PNR)[\s:]*([A-Z0-9]{6})\b', full_text, re.IGNORECASE)
    if pnr_match:
        parsed_data["pnr"] = pnr_match.group(1).upper()
    else:
        fallback_match = re.search(r'\b([A-Z0-9]{6})\b', full_text)
        if fallback_match:
            parsed_data["pnr"] = fallback_match.group(1).upper()
            
    # 2. Zugnummer (Train Number)
    train_match = re.search(r'\b(ICE|IC|EC|RE|RB|S|NJ|RJ|RJX|TGV)\s*(\d+)\b', full_text)
    if train_match:
        parsed_data["train_no"] = f"{train_match.group(1)} {train_match.group(2)}"
        
    # 3. Datum (Date) - Format: DD.MM.YYYY oder DD.MM.YY
    date_match = re.search(r'\b(\d{2}\.\d{2}\.\d{2,4})\b', full_text)
    if date_match:
        parsed_data["date"] = date_match.group(1)

    # 4. Zeiten (Times) - Format: HH:MM
    # Wir suchen nach 'ab' (Abfahrt) und 'an' (Ankunft) oder nehmen einfach die ersten beiden Zeiten
    times = re.findall(r'\b([0-2][0-9]:[0-5][0-9])\b', full_text)
    
    ab_match = re.search(r'(?:ab|Abfahrt)[\s:]*([0-2][0-9]:[0-5][0-9])', full_text, re.IGNORECASE)
    an_match = re.search(r'(?:an|Ankunft)[\s:]*([0-2][0-9]:[0-5][0-9])', full_text, re.IGNORECASE)
    
    if ab_match:
        parsed_data["departure_time"] = ab_match.group(1)
    elif len(times) > 0:
        parsed_data["departure_time"] = times[0]
        
    if an_match:
        parsed_data["arrival_time"] = an_match.group(1)
    elif len(times) > 1:
        parsed_data["arrival_time"] = times[1]

    # 5. Bahnhöfe (Stations) - Erweiterte Suche
    # Oft stehen Bahnhöfe nach "Von" und "Nach" oder "Halt" oder enden mit "Hbf"
    von_match = re.search(r'(?:Von|von)[\s:]+([A-Za-zÄÖÜäöüß\s\-\(\)]+?(?:Hbf|Bf|Flughafen|Bahnhof)?)[\r\n]', full_text)
    nach_match = re.search(r'(?:Nach|nach)[\s:]+([A-Za-zÄÖÜäöüß\s\-\(\)]+?(?:Hbf|Bf|Flughafen|Bahnhof)?)[\r\n]', full_text)
    
    if von_match:
        parsed_data["departure_station"] = von_match.group(1).strip()
    if nach_match:
        parsed_data["arrival_station"] = nach_match.group(1).strip()
        
    # Fallback für Bahnhöfe: Suche nach Zeilen, die "Hbf" enthalten
    if parsed_data["departure_station"] == "Unbekannt" or parsed_data["arrival_station"] == "Unbekannt":
        hbf_lines = re.findall(r'^.*Hbf.*$', full_text, re.MULTILINE)
        if len(hbf_lines) >= 1 and parsed_data["departure_station"] == "Unbekannt":
            parsed_data["departure_station"] = hbf_lines[0].strip()
        if len(hbf_lines) >= 2 and parsed_data["arrival_station"] == "Unbekannt":
            parsed_data["arrival_station"] = hbf_lines[1].strip()

    return parsed_data
