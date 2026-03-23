from pydantic import BaseModel
from typing import List, Optional

class Lawyer(BaseModel):
    id: str
    name: str
    district: str
    phone: str
    is_nalsa_certified: bool
    distance_km: Optional[float] = None
