import pytesseract
from PIL import Image
import io
import base64
import logging
import time

logger = logging.getLogger("LegalLens")

class OCRService:
    def __init__(self):
        self.mock = False
        try:
            # Check if tesseract is installed
            pytesseract.get_tesseract_version()
        except Exception as e:
            logger.error(f"Tesseract not found: {e}. OCR will use mock mode.")
            self.mock = True
            
    def extract_text(self, image_base64: str) -> str:
        if self.mock:
            time.sleep(1) # Simulate processing
            return "This is a mock legal document. It contains clauses about rent, eviction, and security deposits. The tenant agrees to pay 10,000 INR per month."
            
        try:
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            return "Error extracting text from document."

ocr_service = OCRService()
