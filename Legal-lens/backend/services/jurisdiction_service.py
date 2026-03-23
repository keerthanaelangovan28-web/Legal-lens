import httpx
import redis
from pydantic import BaseModel
from ..config import settings
import json

class Jurisdiction(BaseModel):
    state: str
    district: str
    pincode: str

# Redis client for caching
redis_client = redis.from_url(settings.REDIS_URL)

STATE_MAPPING = {
    "TN": "Tamil Nadu",
    "Tamil Nadu": "Tamil Nadu",
    "MH": "Maharashtra",
    "Maharashtra": "Maharashtra",
    "KA": "Karnataka",
    "Karnataka": "Karnataka",
    "KL": "Kerala",
    "Kerala": "Kerala",
    "AP": "Andhra Pradesh",
    "Andhra Pradesh": "Andhra Pradesh",
    "TS": "Telangana",
    "Telangana": "Telangana",
    # Add more mappings as needed
}

async def resolve(latitude: float, longitude: float) -> Jurisdiction:
    # Round lat/lon to 2 decimal places for caching (~1.1km precision)
    cache_key = f"geo:{round(latitude, 2)}:{round(longitude, 2)}"
    
    cached = redis_client.get(cache_key)
    if cached:
        return Jurisdiction(**json.loads(cached))
    
    try:
        # Check for mock mode or if GPS is invalid
        if latitude == 0.0 and longitude == 0.0:
            return Jurisdiction(state="Tamil Nadu", district="Chennai", pincode="600001")

        async with httpx.AsyncClient() as client:
            url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
            headers = {"User-Agent": "LegalLens/1.0"}
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            address = data.get("address", {})
            state_raw = address.get("state", "Unknown")
            district = address.get("state_district") or address.get("city_district") or address.get("district") or "Unknown"
            pincode = address.get("postcode", "000000")
            
            # Map state name
            state = STATE_MAPPING.get(state_raw, state_raw)
            
            jurisdiction = Jurisdiction(state=state, district=district, pincode=pincode)
            
            # Cache for 24 hours
            redis_client.setex(cache_key, 86400, jurisdiction.model_dump_json())
            
            return jurisdiction
            
    except Exception as e:
        print(f"Geocoding error: {e}")
        return Jurisdiction(state="Tamil Nadu", district="Unknown", pincode="000000")
