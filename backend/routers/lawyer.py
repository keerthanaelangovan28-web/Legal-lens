from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
import os
from ..models.lawyer_model import Lawyer
from ..services import jurisdiction_service, twilio_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/lawyer", tags=["lawyer"])

class SOSRequest(BaseModel):
    user_phone: str
    user_name: str
    lawyer_phone: str
    crisis_type: str
    family_phone: Optional[str] = None
    location_url: Optional[str] = None

@router.get("/jurisdiction")
async def get_jurisdiction(lat: float, lon: float):
    return await jurisdiction_service.resolve(lat, lon)

@router.post("/sos/call")
async def initiate_sos(request: SOSRequest):
    # 1. Initiate bridge call
    call_result = twilio_service.twilio_service.initiate_sos_call(
        request.user_phone,
        request.lawyer_phone,
        request.crisis_type
    )
    
    # 2. Send family alert if provided
    if request.family_phone:
        twilio_service.twilio_service.send_family_alert(
            request.user_name,
            request.user_phone,
            request.family_phone,
            request.crisis_type,
            request.location_url or "Unknown Location"
        )
        
    return call_result

@router.get("/nearest", response_model=List[Lawyer])
async def get_nearest_lawyers(
    latitude: float,
    longitude: float,
    crisis_type: str
):
    # 1. Resolve jurisdiction
    jurisdiction = await jurisdiction_service.resolve(latitude, longitude)
    state_file = f"backend/data/lawyers/{jurisdiction.state.lower().replace(' ', '_')}.json"
    
    if not os.path.exists(state_file):
        # Fallback to a generic file or empty list
        # For development, let's return some mock data if file doesn't exist
        return [
            Lawyer(
                id="1",
                name="Adv. Rajesh Kumar",
                district=jurisdiction.district,
                certified=True,
                phone="+919876543210",
                crisis_specializations=["police_detention", "eviction"],
                nalsa_id="NALSA-TN-001"
            ),
            Lawyer(
                id="2",
                name="Adv. S. Meena",
                district=jurisdiction.district,
                certified=True,
                phone="+919876543211",
                crisis_specializations=["domestic_violence", "police_detention"],
                nalsa_id="NALSA-TN-002"
            )
        ]
        
    try:
        with open(state_file, "r") as f:
            lawyers_data = json.load(f)
            
        lawyers = []
        for l in lawyers_data:
            # Filter by crisis specialization
            if crisis_type in l.get("crisis_specializations", []):
                lawyers.append(l)
                
        # Sort by: same district first
        def sort_key(l):
            return 0 if l.get("district") == jurisdiction.district else 1
            
        lawyers.sort(key=sort_key)
        
        # Return top 3
        return [Lawyer(id=l.get("nalsa_id", "0"), **l) for l in lawyers[:3]]
        
    except Exception as e:
        print(f"Error loading lawyers: {e}")
        return []
