from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
import os
from pathlib import Path
from ..models.lawyer_model import Lawyer, LawyerCallRequest, LawyerCallResponse, FCMTokenRequest
from ..services import jurisdiction_service
from ..services.twilio_service import twilio_service
from ..services.firebase_service import firebase_service
import logging

router = APIRouter(prefix="/api/lawyer", tags=["lawyer"])
logger = logging.getLogger("LegalLens")

DATA_DIR = Path(__file__).parent.parent / "data" / "lawyers"


def _load_lawyers_for_state(state_name: str) -> list:
    filename = state_name.lower().replace(" ", "_") + ".json"
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading lawyers from {filepath}: {e}")
        return []


@router.get("/jurisdiction")
async def get_jurisdiction(lat: float, lon: float):
    """Resolve lat/lon to state + district using Nominatim reverse geocoding."""
    return await jurisdiction_service.resolve(lat, lon)


@router.get("/nearest", response_model=List[Lawyer])
async def get_nearest_lawyers(
    latitude: float = Query(...),
    longitude: float = Query(...),
    crisis_type: str = Query(...),
):
    """Return top 3 nearest NALSA-certified lawyers filtered by crisis type."""
    try:
        jurisdiction = await jurisdiction_service.resolve(latitude, longitude)
        lawyers_raw = _load_lawyers_for_state(jurisdiction.state)

        if not lawyers_raw:
            # Fallback generic lawyers
            lawyers_raw = [
                {
                    "id": "nalsa-fallback-1",
                    "name": "District Legal Services Authority",
                    "district": jurisdiction.district,
                    "state": jurisdiction.state,
                    "phone": "15100",
                    "nalsa_id": "DLSA-GENERIC",
                    "certified": True,
                    "crisis_specializations": [
                        "police_detention", "domestic_violence",
                        "eviction", "salary_theft", "consumer_fraud"
                    ],
                    "available_hours": "10AM-5PM Mon-Fri",
                }
            ]

        # Filter by crisis specialization
        matching = [
            l for l in lawyers_raw
            if crisis_type in l.get("crisis_specializations", [])
        ]

        # Sort: same district first, then alphabetical
        matching.sort(key=lambda l: (0 if l.get("district") == jurisdiction.district else 1, l.get("name", "")))

        # Build Lawyer objects for top 3
        result = []
        for l in matching[:3]:
            result.append(Lawyer(
                id=l.get("nalsa_id", l.get("id", "0")),
                name=l["name"],
                district=l.get("district", jurisdiction.district),
                state=l.get("state", jurisdiction.state),
                phone=l["phone"],
                whatsapp=l.get("whatsapp"),
                nalsa_id=l.get("nalsa_id"),
                crisis_specializations=l.get("crisis_specializations", []),
                certified=l.get("certified", True),
                available_hours=l.get("available_hours"),
                is_nalsa_certified=l.get("certified", True),
            ))

        return result

    except Exception as e:
        logger.error(f"Error fetching nearest lawyers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/call", response_model=LawyerCallResponse)
async def initiate_lawyer_call(request: LawyerCallRequest):
    """
    Initiate a Twilio conference bridge between the user and a lawyer.
    Optionally sends family SMS alert and push notification.
    """
    logger.info(
        f"SOS Call request: user={request.user_phone}, lawyer={request.lawyer_id}, crisis={request.crisis_type}"
    )

    # 1. Initiate Twilio bridge call
    call_result = twilio_service.initiate_sos_call(
        user_phone=request.user_phone,
        lawyer_phone=request.lawyer_phone,
        crisis_type=request.crisis_type,
    )

    if call_result.get("status") == "failed":
        raise HTTPException(
            status_code=503,
            detail=f"Call initiation failed: {call_result.get('error', 'Unknown error')}"
        )

    # 2. Send family SMS alert if contact provided
    family_sent = False
    if request.family_phone:
        try:
            twilio_service.send_family_alert(
                user_name=request.user_name or "LegalLens User",
                user_phone=request.user_phone,
                family_phone=request.family_phone,
                crisis_type=request.crisis_type,
                location_url=request.location_url or "Unknown Location",
            )
            family_sent = True
        except Exception as e:
            logger.warning(f"Family alert SMS failed (non-critical): {e}")

    # 3. Send push notification to user confirming call started
    push_sent = False
    if request.fcm_token:
        try:
            result = firebase_service.send_crisis_notification(
                fcm_token=request.fcm_token,
                crisis_type=request.crisis_type,
                title="Lawyer Call Connecting",
                body=f"Your call with a NALSA lawyer is being connected. Please wait.",
            )
            push_sent = result.get("status") == "sent"
        except Exception as e:
            logger.warning(f"Push notification failed (non-critical): {e}")

    return LawyerCallResponse(
        call_sid=call_result.get("sid", "UNKNOWN"),
        status=call_result.get("status", "initiated"),
        message="SOS call initiated successfully. Connecting you to a NALSA lawyer.",
        family_alert_sent=family_sent,
        push_sent=push_sent,
    )


@router.post("/sos/call")
async def initiate_sos_legacy(request: LawyerCallRequest):
    """Legacy endpoint alias for /call — kept for backward compatibility."""
    return await initiate_lawyer_call(request)


@router.post("/register-token")
async def register_fcm_token(request: FCMTokenRequest):
    """Register or update a user's FCM push notification token."""
    success = firebase_service.register_device_token(request.user_id, request.fcm_token)
    return {"success": success, "message": "FCM token registered successfully"}
