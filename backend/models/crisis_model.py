from pydantic import BaseModel
from typing import List, Optional

class LegalRight(BaseModel):
    description: str
    section_number: str
    act_name: str
    act_year: int

class ScriptedPhrase(BaseModel):
    phrase: str
    language: str
    transliteration: Optional[str] = None

class LegalResponse(BaseModel):
    crisis_type: str
    jurisdiction_state: str
    rights: List[LegalRight]
    scripted_phrase: ScriptedPhrase
    confidence_score: float
    lawyer_available: bool
    nearest_lawyer_phone: Optional[str] = None
    offline_available: bool

class CrisisRequest(BaseModel):
    text: str
    language: str = "en"
    latitude: float
    longitude: float
