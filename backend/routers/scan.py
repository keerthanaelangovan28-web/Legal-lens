from fastapi import APIRouter, HTTPException
from ..models.scan_model import ScanRequest, ScanResult
from ..services import ocr_service, summarizer_service, translation_service

router = APIRouter(prefix="/api/scan", tags=["scan"])

@router.post("/", response_model=ScanResult)
async def scan_document(request: ScanRequest):
    # 1. OCR
    text = ocr_service.ocr_service.extract_text(request.image_base64)
    
    # 2. Summarization
    summary_data = summarizer_service.summarizer_service.summarize(text)
    
    # 3. Translation (if needed)
    if request.language != "en":
        summary_data["summary"] = translation_service.translation_service.translate(summary_data["summary"], target_lang=request.language)
        summary_data["key_clauses"] = [translation_service.translation_service.translate(c, target_lang=request.language) for c in summary_data["key_clauses"]]
        
    return ScanResult(
        text=text,
        summary=summary_data["summary"],
        key_clauses=summary_data["key_clauses"],
        detected_language="en", # Placeholder
        is_legally_binding=True, # Placeholder
        risk_score=summary_data["risk_score"]
    )
