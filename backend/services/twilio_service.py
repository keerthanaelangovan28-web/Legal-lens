from twilio.rest import Client
from ..config import settings
from ..database import log_sos_call
import logging
import time

logger = logging.getLogger("LegalLens")

class TwilioService:
    def __init__(self):
        self.mock = settings.TWILIO_MOCK
        if not self.mock:
            try:
                self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}. Falling back to mock mode.")
                self.mock = True
        
    def send_sms(self, to_number: str, message: str):
        if self.mock:
            logger.info(f"[MOCK SMS] To: {to_number} | Message: {message}")
            return {"sid": "MOCK_SID_123", "status": "sent"}
        
        try:
            message = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )
            return {"sid": message.sid, "status": message.status}
        except Exception as e:
            logger.error(f"Twilio SMS error: {e}")
            return {"error": str(e), "status": "failed"}

    def initiate_sos_call(self, user_phone: str, lawyer_phone: str, crisis_type: str) -> dict:
        # 1. Bridge call (Conference)
        # In a real scenario, you'd use TwiML to bridge the two parties.
        # For this implementation, we'll simulate the conference initiation.
        twiml_url = f"https://handler.twilio.com/twiml/EHxxxxxxxx?UserPhone={user_phone}&LawyerPhone={lawyer_phone}"
        
        if self.mock:
            logger.info(f"[MOCK SOS CALL] Bridging {user_phone} and {lawyer_phone} for {crisis_type}")
            log_sos_call(user_phone, lawyer_phone, crisis_type, "mock_initiated")
            return {"sid": "MOCK_SOS_SID_123", "status": "bridged"}

        try:
            # Call user first, then bridge to lawyer
            call = self.client.calls.create(
                url=twiml_url,
                to=user_phone,
                from_=settings.TWILIO_PHONE_NUMBER
            )
            log_sos_call(user_phone, lawyer_phone, crisis_type, "initiated")
            return {"sid": call.sid, "status": call.status}
        except Exception as e:
            logger.error(f"Twilio SOS Call error: {e}")
            return {"error": str(e), "status": "failed"}

    def send_family_alert(self, user_name: str, user_phone: str, family_phone: str, crisis_type: str, location_url: str):
        timestamp = time.strftime('%H:%M')
        message = (
            f"LegalLens Alert: {user_name} has activated emergency legal help for {crisis_type} at {timestamp}. "
            f"They are safe and getting legal assistance. Location: {location_url}"
        )
        return self.send_sms(family_phone, message)

    def make_call(self, to_number: str, twiml_url: str):
        if self.mock:
            logger.info(f"[MOCK CALL] To: {to_number} | TwiML URL: {twiml_url}")
            return {"sid": "MOCK_CALL_SID_123", "status": "queued"}
            
        try:
            call = self.client.calls.create(
                url=twiml_url,
                to=to_number,
                from_=settings.TWILIO_PHONE_NUMBER
            )
            return {"sid": call.sid, "status": call.status}
        except Exception as e:
            logger.error(f"Twilio Call error: {e}")
            return {"error": str(e), "status": "failed"}

twilio_service = TwilioService()
