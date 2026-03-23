from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from typing import Optional
import time
import json
import redis
import asyncio
from ..models.crisis_model import LegalResponse, CrisisRequest, LegalRight, ScriptedPhrase
from ..services import whisper_service, classifier_service, rag_service, jurisdiction_service
from ..config import settings

router = APIRouter(prefix="/api/crisis", tags=["crisis"])
redis_client = redis.from_url(settings.REDIS_URL)

async def store_session_in_db(response: LegalResponse, user_text: str):
    # Async, do not wait - placeholder for actual DB logic
    # In a real app, this would use an async DB driver like asyncpg or SQLAlchemy
    await asyncio.sleep(0.1)
    print(f"Session stored in DB for {response.crisis_type}")

@router.post("/voice", response_model=LegalResponse)
async def process_voice_crisis(
    audio_file: UploadFile = File(...),
    language: str = Form("auto"),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0)
):
    t0 = time.time()
    
    # 1. Transcription
    audio_bytes = await audio_file.read()
    t1_start = time.time()
    transcription = whisper_service.transcribe_audio(audio_bytes, language_hint=None if language == "auto" else language)
    t1_end = time.time()
    print(f"T1: Whisper transcription took {t1_end - t1_start:.2f}s")
    
    text = transcription["text"]
    
    # 2. Classification
    t2_start = time.time()
    classification = classifier_service.classify_crisis(text)
    t2_end = time.time()
    print(f"T2: Classification took {t2_end - t2_start:.2f}s")
    
    crisis_type = classification["crisis_type"]
    
    # 3. Jurisdiction
    t3_start = time.time()
    jurisdiction = await jurisdiction_service.resolve(latitude, longitude)
    t3_end = time.time()
    print(f"T3: Jurisdiction resolution took {t3_end - t3_start:.2f}s")
    
    jurisdiction_state = jurisdiction.state
    
    # 4. Check Redis cache
    cache_key = f"crisis:{crisis_type}:{jurisdiction_state}:{language}"
    cached_response = redis_client.get(cache_key)
    if cached_response:
        print("T4: CACHE HIT")
        return LegalResponse(**json.loads(cached_response))
    
    # 5. RAG Query
    t5_start = time.time()
    # Initialize RAGService if not already (in main.py)
    # For simplicity, we'll assume rag_service is already initialized
    # and has a query method
    from ..services.rag_service import RAGService
    rag = RAGService() # In production, this would be a singleton
    response = rag.query(crisis_type, text, jurisdiction_state, language)
    t5_end = time.time()
    print(f"T5: RAG query took {t5_end - t5_start:.2f}s")
    
    # 6. Store in Redis with TTL 3600 seconds
    redis_client.setex(cache_key, 3600, response.model_dump_json())
    
    # 7. Store session in PostgreSQL (async, do not wait)
    asyncio.create_task(store_session_in_db(response, text))
    
    total_time = time.time() - t0
    print(f"Total pipeline time: {total_time:.2f}s")
    if total_time > 5.0:
        print(f"WARNING: Pipeline took longer than 5 seconds: {total_time:.2f}s")
        
    return response

@router.post("/text", response_model=LegalResponse)
async def process_text_crisis(request: CrisisRequest):
    t0 = time.time()
    
    # 2. Classification
    t2_start = time.time()
    classification = classifier_service.classify_crisis(request.text)
    t2_end = time.time()
    print(f"T2: Classification took {t2_end - t2_start:.2f}s")
    
    crisis_type = classification["crisis_type"]
    
    # 3. Jurisdiction
    t3_start = time.time()
    jurisdiction = await jurisdiction_service.resolve(request.latitude, request.longitude)
    t3_end = time.time()
    print(f"T3: Jurisdiction resolution took {t3_end - t3_start:.2f}s")
    
    jurisdiction_state = jurisdiction.state
    
    # 4. Check Redis cache
    cache_key = f"crisis:{crisis_type}:{jurisdiction_state}:{request.language}"
    cached_response = redis_client.get(cache_key)
    if cached_response:
        print("T4: CACHE HIT")
        return LegalResponse(**json.loads(cached_response))
    
    # 5. RAG Query
    t5_start = time.time()
    from ..services.rag_service import RAGService
    rag = RAGService()
    response = rag.query(crisis_type, request.text, jurisdiction_state, request.language)
    t5_end = time.time()
    print(f"T5: RAG query took {t5_end - t5_start:.2f}s")
    
    # 6. Store in Redis
    redis_client.setex(cache_key, 3600, response.model_dump_json())
    
    # 7. Store session
    asyncio.create_task(store_session_in_db(response, request.text))
    
    return response

@router.get("/offline-pack")
async def get_offline_pack():
    try:
        with open("backend/data/offline_cache/top50.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        return []
