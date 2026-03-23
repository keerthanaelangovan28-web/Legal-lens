"""
User management router — FCM token registration and push notification endpoints.
POST /api/user/fcm-token  — Register/update device FCM token
POST /api/user/send-crisis-notification — Send crisis notification to user device
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.firebase_service import firebase_service
import logging

router = APIRouter(prefix="/api/user", tags=["user"])
logger = logging.getLogger("LegalLens")


class FCMTokenRequest(BaseModel):
    user_id: str
    fcm_token: str


class CrisisNotificationRequest(BaseModel):
    fcm_token: str
    crisis_type: str
    title: Optional[str] = "LegalLens Alert"
    body: Optional[str] = None


@router.post("/fcm-token")
async def register_fcm_token(request: FCMTokenRequest):
    """
    Register or update a user's Firebase Cloud Messaging device token.
    Called on app launch and when the token is refreshed.
    """
    try:
        success = firebase_service.register_device_token(request.user_id, request.fcm_token)
        return {
            "success": success,
            "message": "FCM token registered successfully",
            "user_id": request.user_id,
        }
    except Exception as e:
        logger.error(f"Error registering FCM token: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-crisis-notification")
async def send_crisis_notification(request: CrisisNotificationRequest):
    """
    Send a push notification to a device about a detected crisis.
    Used by backend to notify user of completed processing.
    """
    try:
        result = firebase_service.send_crisis_notification(
            fcm_token=request.fcm_token,
            crisis_type=request.crisis_type,
            title=request.title or "LegalLens Alert",
            body=request.body,
        )
        return result
    except Exception as e:
        logger.error(f"Error sending crisis notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-family-alert-push")
async def send_family_alert_push(
    fcm_token: str,
    user_name: str,
    crisis_type: str,
):
    """Send a push notification to a family member's device."""
    try:
        result = firebase_service.send_family_alert_notification(
            fcm_token=fcm_token,
            user_name=user_name,
            crisis_type=crisis_type,
        )
        return result
    except Exception as e:
        logger.error(f"Error sending family alert push: {e}")
        raise HTTPException(status_code=500, detail=str(e))
