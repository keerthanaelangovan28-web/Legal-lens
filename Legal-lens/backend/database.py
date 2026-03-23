import psycopg2
from .config import settings
import logging
import time

logger = logging.getLogger("LegalLens")

def get_db_connection():
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        # Create calls table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sos_calls (
                id SERIAL PRIMARY KEY,
                user_phone VARCHAR(20),
                lawyer_phone VARCHAR(20),
                crisis_type VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20)
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

def log_sos_call(user_phone: str, lawyer_phone: str, crisis_type: str, status: str = "initiated"):
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO sos_calls (user_phone, lawyer_phone, crisis_type, status) VALUES (%s, %s, %s, %s)",
            (user_phone, lawyer_phone, crisis_type, status)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to log SOS call: {e}")
