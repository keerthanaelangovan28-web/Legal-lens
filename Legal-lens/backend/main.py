from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from .routers import crisis, lawyer, scan, health, user
from .services import whisper_service, classifier_service, rag_service
from .config import settings
from .database import init_db
import redis

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("LegalLens")

app = FastAPI(title="LegalLens API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    # Extract crisis_type from query params or body if possible
    crisis_type = request.query_params.get("crisis_type", "N/A")
    
    logger.info(
        f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')} | "
        f"Endpoint: {request.url.path} | "
        f"Response Time: {process_time:.2f}ms | "
        f"Crisis Type: {crisis_type}"
    )
    
    return response

# On Startup: Initialize services and load models
@app.on_event("startup")
async def startup_event():
    logger.info("Starting LegalLens API...")
    
    # Initialize database
    init_db()
    
    # Initialize services (this loads models into memory)
    # whisper_service.model is loaded at module level in its file
    # classifier_service.classifier is loaded at module level
    # rag_service.RAGService() will be initialized here
    
    logger.info("Whisper model loaded.")
    logger.info("Classifier model loaded.")
    
    # Test Redis connection
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        logger.info("Redis connected successfully.")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")

# Include Routers
app.include_router(crisis.router)
app.include_router(lawyer.router)
app.include_router(scan.router)
app.include_router(health.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "LegalLens API is running", "version": "1.0.0"}
