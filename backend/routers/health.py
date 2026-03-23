from fastapi import APIRouter
import time

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("/")
async def health_check():
    return {
        "status": "ok",
        "timestamp": time.time(),
        "version": "1.0.0"
    }
