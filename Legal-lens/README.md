# LegalLens — Real-Time AI Legal Rights Co-Pilot for Indian Citizens

**LegalLens** is a production-grade mobile application that helps Indian citizens quickly understand their legal rights during crises — police detention, domestic violence, wrongful eviction, salary theft, and consumer fraud.

With one tap and one spoken sentence, users receive their exact legal rights with specific Indian law citations, a scripted phrase to say, and one-tap access to a free NALSA legal aid lawyer — all in under 5 seconds, even offline.

---

## Table of Contents
1. [Tech Stack](#tech-stack)  
2. [Quick Start (Docker)](#quick-start-docker)  
3. [Run Mobile App](#run-mobile-app)  
4. [Demo Mode](#demo-mode)  
5. [Adding Laws to the Corpus](#adding-laws-to-the-corpus)  
6. [API Documentation](#api-documentation)  
7. [Project Structure](#project-structure)  
8. [Team](#team)  

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native, Expo SDK 51, TypeScript |
| Navigation | Expo Router (file-based) |
| State Management | Zustand |
| Backend API | Python FastAPI |
| Speech-to-Text | OpenAI Whisper (tiny model) |
| Crisis Classifier | ai4bharat/IndicBERT (zero-shot) |
| RAG Engine | LlamaIndex + ChromaDB + Ollama (Llama 3 8B) |
| Embeddings | paraphrase-multilingual-MiniLM-L12-v2 |
| Database | PostgreSQL (sessions), ChromaDB (law vector store) |
| Auth | Supabase |
| SMS/Calls | Twilio |
| Push Notifications | Firebase FCM |
| Caching | Redis |
| Deployment | Railway (backend), Expo EAS (mobile) |

---

## Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/your-org/legallens.git
cd legallens

# Copy environment config
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# Pull Llama 3 model (first time — ~5GB download)
docker exec legallens-ollama ollama pull llama3:8b

# Build the law vector store (first time only)
docker exec legallens-backend python ml/build_vector_store.py

# The API is now available at http://localhost:8000
# API docs (Swagger): http://localhost:8000/docs
```

**Services started by Docker:**
| Service | Port | Description |
|---|---|---|
| FastAPI Backend | 8000 | Main API server |
| ChromaDB | 8001 | Vector database |
| Redis | 6379 | Cache |
| Ollama | 11434 | LLM inference |
| PostgreSQL | 5432 | Session database |

---

## Run Mobile App

```bash
# Navigate to mobile app
cd legallens

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Scan QR with Expo Go app (iOS/Android)
# Or press 'a' for Android emulator, 'i' for iOS simulator
```

**Environment Variables** — create `legallens/.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Demo Mode

Demo Mode lets you showcase LegalLens without network dependencies — perfect for presentations and expos.

**Activate Demo Mode:**
1. Open the app → go to **Profile** tab
2. Tap the app version number **5 times** rapidly
3. An orange "DEMO MODE" banner will appear at the top of all screens

**Demo Scenarios available:**
| Scenario | What it shows |
|---|---|
| Police Detention | Voice input → CrPC 41D rights → scripted phrase → lawyer card |
| Document Scan | Pre-loaded eviction notice → OCR animation → eviction rights |
| Tamil Language | Tamil voice input → auto language detection → Tamil response |

**In Demo Mode:**
- No real API calls are made
- No real Twilio calls are triggered
- All SOS buttons show "Simulated call" 
- Each loading step has a 0.8 second realistic delay

---

## Adding Laws to the Corpus

Laws are stored as JSON files in `backend/data/law_corpus/`. Each file covers one crisis category.

**Schema for a law entry:**
```json
{
  "section_id": "CrPC_41D",
  "act_name": "Code of Criminal Procedure",
  "act_year": 1973,
  "section_number": "41D",
  "section_title": "Right of arrested person to meet an advocate",
  "full_text": "Full legal text of the section...",
  "plain_language": "You have the right to meet your lawyer during police interrogation",
  "crisis_tags": ["police_detention"],
  "states_applicable": ["all"],
  "keywords": ["arrested", "lawyer", "interrogation", "advocate"]
}
```

**To add new laws:**
1. Add entries to the appropriate JSON file in `backend/data/law_corpus/`
2. Rebuild the vector store:
   ```bash
   cd backend && python ml/build_vector_store.py
   ```
3. Restart the backend:
   ```bash
   docker-compose restart backend
   ```

**State-specific laws:** Set `states_applicable` to `["Tamil Nadu"]` or `["Maharashtra"]` etc. to scope the law to specific states.

---

## API Documentation

### Base URL: `http://localhost:8000/api`

---

### `POST /crisis/voice`
Process a voice recording and return legal rights.

**Request:** `multipart/form-data`
```
audio_file: <binary audio file> (m4a, wav, mp3, webm)
language:   "auto" | "en" | "hi" | "ta" | "te" | "kn" | "ml"
latitude:   12.9716  (float)
longitude:  77.5946  (float)
```

**Response:** `200 OK`
```json
{
  "crisis_type": "police_detention",
  "jurisdiction_state": "Tamil Nadu",
  "rights": [
    {
      "description": "You have the right to meet your lawyer during interrogation",
      "section_number": "41D",
      "act_name": "Code of Criminal Procedure",
      "act_year": 1973
    },
    { "...": "..." },
    { "...": "..." }
  ],
  "scripted_phrase": {
    "phrase": "I am invoking my right under Section 41D CrPC...",
    "language": "ta",
    "transliteration": "Naan Section 41D CrPC padiya..."
  },
  "confidence_score": 0.92,
  "lawyer_available": true,
  "nearest_lawyer_phone": "+91-98400-12345",
  "offline_available": true,
  "cached": false
}
```

---

### `POST /crisis/text`
Process a text description (no voice transcription).

**Request:** `application/json`
```json
{
  "text": "Police stopped me and want to take me to the station",
  "language": "en",
  "latitude": 13.0827,
  "longitude": 80.2707
}
```
**Response:** Same as `/crisis/voice`

---

### `POST /crisis/scan`
Scan a document image and extract relevant legal rights.

**Request:** `multipart/form-data`
```
image_file: <binary image> (jpg, png)
language:   "en" | "ta" | ...
```

**Response:** `200 OK`
```json
{
  "document_type": "eviction_notice",
  "extracted_text": "Dear Tenant, You are hereby required to vacate...",
  "problematic_clause": "Immediate vacation within 3 days",
  "legal_response": { "...": "same as /crisis/voice response" }
}
```

---

### `GET /crisis/offline-pack`
Download all 50 pre-computed crisis responses for offline use.

**Response:** `200 OK` — JSON array of 50 `LegalResponse` objects  
**Caching:** `Cache-Control: max-age=86400`

---

### `GET /lawyer/nearest`
Get nearest NALSA-certified lawyers.

**Query Params:**
```
latitude=13.0827&longitude=80.2707&crisis_type=police_detention
```

**Response:** `200 OK`
```json
{
  "lawyers": [
    {
      "name": "Advocate P. Karthikeyan",
      "district": "Chennai",
      "state": "Tamil Nadu",
      "phone": "+91-98400-12345",
      "nalsa_id": "TN-NALSA-2021-001",
      "crisis_specializations": ["police_detention", "domestic_violence"],
      "distance_km": 2.4
    }
  ],
  "district_legal_aid_phone": "044-25331286",
  "nalsa_helpline": "15100"
}
```

---

### `GET /health`
Service health check.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "whisper_loaded": true,
  "classifier_loaded": true,
  "rag_ready": true
}
```

---

## Project Structure

```
legallens/                     ← Expo React Native app
├── app/                       ← Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx          ← Panic Home screen (main entry)
│   │   ├── history.tsx        ← Past crisis sessions timeline
│   │   ├── rights.tsx         ← Browse rights by category
│   │   └── profile.tsx        ← Language, emergency contacts, settings
│   ├── crisis/
│   │   ├── [type].tsx         ← Crisis voice/text input screen
│   │   └── result.tsx         ← Rights output display
│   ├── sos/index.tsx          ← Lawyer call screen
│   ├── scan/index.tsx         ← Document scanner
│   └── _layout.tsx            ← Root layout
├── components/ui/             ← Reusable UI components
├── services/                  ← API, audio, offline, location
├── store/                     ← Zustand state
├── constants/                 ← Theme, languages, crisis types
├── hooks/                     ← useVoiceInput, useLegalQuery, etc.
└── types/                     ← TypeScript interfaces

backend/                       ← FastAPI Python backend
├── main.py                    ← App entry point
├── routers/                   ← API route handlers
├── services/                  ← Whisper, RAG, Classifier, etc.
├── models/                    ← Pydantic models
├── data/law_corpus/           ← 53+ Indian law JSON entries
├── data/lawyers/              ← NALSA lawyer directory by state
├── data/offline_cache/        ← Pre-computed top 50 responses
└── ml/                        ← Training + vector store scripts
```

---

## Team

| Role | Responsibility |
|---|---|
| **Full-Stack Lead** | Expo mobile app architecture, API integration |
| **AI/ML Engineer** | Whisper ASR, IndicBERT classifier, RAG pipeline |
| **Backend Engineer** | FastAPI, Redis caching, PostgreSQL, Docker |
| **Legal Researcher** | Indian law corpus curation, rights verification |
| **UX Designer** | Panic-optimized UI, accessibility, language localization |

---

## License

This project is built for social impact. All Indian law citations are sourced from public domain government sources.

**NALSA Helpline: 15100** | **Cybercrime: 1930** | **Women Helpline: 181** | **Police: 100**
