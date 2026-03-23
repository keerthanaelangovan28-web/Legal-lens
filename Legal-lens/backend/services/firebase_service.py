"""
Firebase Cloud Messaging (FCM) Push Notification Service for LegalLens
Sends crisis alerts and lawyer connection notifications to user devices.
"""
import logging
import os
from typing import Optional

logger = logging.getLogger("LegalLens")

# Check if firebase_admin is available
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("firebase-admin not installed. Push notifications will be mocked.")

FIREBASE_MOCK = os.getenv("FIREBASE_MOCK", "true").lower() == "true"


class FirebaseService:
    """Push notification service using Firebase Cloud Messaging."""

    def __init__(self):
        self.initialized = False
        self.mock = FIREBASE_MOCK or not FIREBASE_AVAILABLE

        if not self.mock:
            self._initialize()

    def _initialize(self):
        """Initialize Firebase Admin SDK."""
        try:
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
            else:
                # Use application default credentials if no service account path
                cred = credentials.ApplicationDefault()

            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)

            self.initialized = True
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}. Falling back to mock.")
            self.mock = True

    def send_crisis_notification(
        self,
        fcm_token: str,
        crisis_type: str,
        title: str = "LegalLens Alert",
        body: Optional[str] = None,
    ) -> dict:
        """
        Send a crisis notification to a user's device.

        Args:
            fcm_token: Firebase device registration token
            crisis_type: Type of crisis detected (e.g. 'police_detention')
            title: Notification title
            body: Notification body text

        Returns:
            dict with message_id or mock_id
        """
        if not body:
            body = self._get_default_body(crisis_type)

        if self.mock:
            logger.info(
                f"[MOCK FCM] To: {fcm_token[:20]}... | Title: {title} | Body: {body}"
            )
            return {"message_id": "MOCK_FCM_MSG_ID_123", "status": "sent"}

        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data={
                    "crisis_type": crisis_type,
                    "action": "OPEN_RESULT",
                    "click_action": "FLUTTER_NOTIFICATION_CLICK",
                },
                android=messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        sound="default",
                        priority="high",
                        channel_id="legallens_crisis",
                    ),
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(sound="default", badge=1)
                    )
                ),
                token=fcm_token,
            )
            message_id = messaging.send(message)
            logger.info(f"FCM notification sent: {message_id}")
            return {"message_id": message_id, "status": "sent"}
        except Exception as e:
            logger.error(f"FCM send error: {e}")
            return {"error": str(e), "status": "failed"}

    def send_lawyer_connected_notification(
        self, fcm_token: str, lawyer_name: str
    ) -> dict:
        """Notify user that a lawyer has accepted their call."""
        return self.send_crisis_notification(
            fcm_token=fcm_token,
            crisis_type="lawyer_connected",
            title="Lawyer Connected",
            body=f"Advocate {lawyer_name} is ready to help you. Tap to join.",
        )

    def send_family_alert_notification(
        self, fcm_token: str, user_name: str, crisis_type: str
    ) -> dict:
        """Notify family member that user has activated LegalLens."""
        crisis_label = crisis_type.replace("_", " ").title()
        return self.send_crisis_notification(
            fcm_token=fcm_token,
            crisis_type="family_alert",
            title=f"LegalLens: {user_name} needs help",
            body=f"{user_name} has activated emergency legal assistance for {crisis_label}. They are safe.",
        )

    def register_device_token(self, user_id: str, fcm_token: str) -> bool:
        """Register or update a user's FCM device token."""
        # In production, store to PostgreSQL via database.py
        logger.info(f"[FCM] Registered token for user: {user_id}")
        return True

    @staticmethod
    def _get_default_body(crisis_type: str) -> str:
        messages = {
            "police_detention": "Your legal rights for police detention have been identified. Tap to view.",
            "domestic_violence": "Safe resources and legal protections are available for you now.",
            "eviction": "Your tenant rights are being retrieved. Tap to view them.",
            "salary_theft": "Your wage rights have been identified. Tap to view action steps.",
            "consumer_fraud": "Your consumer protections have been identified. Tap to view.",
        }
        return messages.get(crisis_type, "LegalLens has identified your legal rights. Tap to view.")


# Singleton instance
firebase_service = FirebaseService()
