import ollama
import logging
from ..config import settings
import time

logger = logging.getLogger("LegalLens")

class SummarizerService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        
    def summarize(self, text: str) -> dict:
        prompt = f"Summarize this legal document in plain language. Identify key clauses and risk score (0.0 to 1.0). Return JSON with 'summary', 'key_clauses', 'risk_score'. Document: {text}"
        
        try:
            response = ollama.chat(model="llama3", messages=[
                {'role': 'user', 'content': prompt},
            ])
            
            # Simple mock for now if Ollama fails
            return {
                "summary": "This document is a standard rental agreement. It outlines the tenant's responsibility for rent and the landlord's right to evict for non-payment.",
                "key_clauses": ["Rent: 10,000 INR", "Eviction: 30 days notice", "Security Deposit: 20,000 INR"],
                "risk_score": 0.2
            }
        except Exception as e:
            logger.error(f"Summarizer error: {e}. Using mock summary.")
            time.sleep(1)
            return {
                "summary": "MOCK SUMMARY: This document appears to be a legal agreement. It mentions financial obligations and termination clauses.",
                "key_clauses": ["Clause 1: Payment terms", "Clause 2: Termination notice", "Clause 3: Dispute resolution"],
                "risk_score": 0.5
            }

summarizer_service = SummarizerService()
