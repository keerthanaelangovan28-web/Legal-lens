# LegalLens ⚖️

LegalLens is an AI-powered emergency legal aid application designed for the Indian context. It provides real-time legal rights, scripted phrases for crisis situations, and connects users with free legal aid (NALSA) lawyers.

## 🚀 Features

- **Crisis Detection**: Voice-activated crisis classification (Police Detention, Domestic Violence, Eviction, etc.).
- **Real-time Rights**: Instant access to relevant sections of the CrPC, IPC, and Constitution.
- **Scripted Phrases**: "Say exactly this" guidance to help users navigate legal encounters safely.
- **SOS Network**: Connects users with NALSA-certified lawyers in their specific district.
- **Offline Mode**: Core legal rights are cached locally for access without internet.
- **Silent Evidence**: Background audio recording and photo evidence collection.
- **Evidence Timeline**: Securely stored history of crisis sessions with PDF export.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device
- (Optional) Docker for backend services

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with your Expo Go app.

## 🧪 Demo Mode

For project demonstrations, LegalLens includes a built-in **Demo Mode** that bypasses real API calls and uses pre-scripted scenarios.

**To enable Demo Mode:**
1. Go to the **Profile** tab.
2. Tap the **App Version** number (at the bottom) **5 times**.
3. A "Developer Options" section will appear.
4. Toggle **Demo Mode** ON.

**Demo Scenarios:**
- **Police Detention**: Simulates voice input and provides rights for a typical detention scenario.
- **Document Scan**: Simulates OCR extraction from an eviction notice.
- **Tamil Language**: Demonstrates multi-language support with Tamil input.

## 📚 Adding Laws to the Corpus

The legal corpus is managed via the backend. To add new laws:
1. Navigate to `server/corpus/`.
2. Add JSON files following the `LawDefinition` schema.
3. Run the indexing script: `npm run index-corpus`.

## 📡 API Documentation

### `POST /api/crisis/classify`
Classifies user input into a crisis category.
- **Request**: `{ "transcript": "string", "language": "en|ta" }`
- **Response**: `{ "type": "CrisisType", "confidence": number }`

### `GET /api/crisis/rights`
Fetches legal protections for a specific crisis.
- **Request**: `?type=POLICE_DETENTION&state=Tamil+Nadu`
- **Response**: `LegalResponse` object.

### `GET /api/crisis/offline-pack`
Returns a bundle of essential rights for offline caching.

## 👥 Team

- **Keerthana Elangovan**: Lead Developer & Product Designer
- **LegalLens AI**: Legal Logic & Corpus Management

---
*Disclaimer: LegalLens provides information for educational purposes and is not a substitute for professional legal advice.*
