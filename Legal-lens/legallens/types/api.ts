// API response and request types for LegalLens backend

import { LegalRight, CrisisType, Jurisdiction } from './crisis';

// ── Generic wrapper ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ── Request types ─────────────────────────────────────────────────────────────
export interface TextCrisisRequest {
  text: string;
  language: string;
  latitude: number;
  longitude: number;
}

// ── Response types ─────────────────────────────────────────────────────────────
export interface ScriptedPhraseResponse {
  phrase: string;
  language: string;
  transliteration?: string;
}

export interface ApiLegalResponse {
  crisis_type: string;
  jurisdiction_state: string;
  rights: Array<{
    description: string;
    section_number: string;
    act_name: string;
    act_year: number;
  }>;
  scripted_phrase: ScriptedPhraseResponse;
  confidence_score: number;
  lawyer_available: boolean;
  nearest_lawyer_phone?: string;
  offline_available: boolean;
  cached?: boolean;
}

export interface LawyerCard {
  id: string;
  name: string;
  district: string;
  state: string;
  phone: string;
  whatsapp?: string;
  nalsa_id: string;
  crisis_specializations: string[];
  available_hours?: string;
  distance_km?: number;
}

export interface NearestLawyersResponse {
  lawyers: LawyerCard[];
  district_legal_aid_phone?: string;
  nalsa_helpline: string;
}

export interface ScanResponse {
  document_type: string;
  problematic_clause?: string;
  extracted_text: string;
  legal_response: ApiLegalResponse;
}

export interface JurisdictionResponse {
  state: string;
  district: string;
  pincode?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  whisper_loaded: boolean;
  classifier_loaded: boolean;
  rag_ready: boolean;
}

export interface OfflinePackEntry {
  id: number;
  crisis_type: string;
  jurisdiction: string | null;
  language: string;
  rights_json: string;
  scripted_phrase: string;
  created_at: string;
}
