from pydantic import BaseModel
from typing import List, Optional


class Lawyer(BaseModel):
    id: str
    name: str
    district: str
    state: Optional[str] = None
    phone: str
    whatsapp: Optional[str] = None
    nalsa_id: Optional[str] = None
    crisis_specializations: Optional[List[str]] = []
    certified: Optional[bool] = True
    available_hours: Optional[str] = None
    distance_km: Optional[float] = None
    is_nalsa_certified: Optional[bool] = True  # alias kept for compatibility


class LawyerCallRequest(BaseModel):
    user_phone: str
    lawyer_id: str
    lawyer_phone: str
    crisis_type: str
    user_name: Optional[str] = "LegalLens User"
    family_phone: Optional[str] = None
    location_url: Optional[str] = None
    fcm_token: Optional[str] = None


class LawyerCallResponse(BaseModel):
    call_sid: str
    status: str
    message: str
    family_alert_sent: bool = False
    push_sent: bool = False


class FCMTokenRequest(BaseModel):
    user_id: str
    fcm_token: str
