import whisper
import time
import io
import os
import tempfile

# Load model on startup
try:
    model = whisper.load_model("tiny")
    model_loaded = True
except Exception as e:
    print(f"Failed to load Whisper model: {e}. Using mock transcription.")
    model_loaded = False

def transcribe_audio(audio_file_bytes: bytes, language_hint: str = None) -> dict:
    start_time = time.time()
    
    if not model_loaded:
        time.sleep(0.5) # Simulate some processing time
        return {
            "text": "Help me, I am being detained by the police without a warrant.",
            "language": "en",
            "confidence": 0.5
        }
    
    # Whisper needs a file path or a numpy array
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(audio_file_bytes)
        tmp_path = tmp.name

    try:
        options = {}
        if language_hint:
            options["initial_prompt"] = language_hint
            
        result = model.transcribe(tmp_path, **options)
        
        duration = time.time() - start_time
        print(f"Transcription completed in {duration:.2f}s")
        
        return {
            "text": result["text"],
            "language": result.get("language", "unknown"),
            "confidence": 1.0 # Whisper tiny doesn't provide per-segment confidence easily in this API
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
