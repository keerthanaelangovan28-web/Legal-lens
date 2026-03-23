from pydantic import BaseModel
from typing import List, Optional

class ScanResult(BaseModel):
    text: str
    summary: str
    key_clauses: List[str]
    detected_language: str
    is_legally_binding: bool
    risk_score: float # 0.0 to 1.0

class ScanRequest(BaseModel):
    image_base64: str
    language: Optional[str] = "en"
