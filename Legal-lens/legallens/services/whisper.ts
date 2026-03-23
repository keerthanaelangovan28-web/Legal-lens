// On-device Whisper fallback service (for offline transcription)
// Note: True on-device Whisper requires native module or ONNX runtime.
// This service provides a structured interface; in Expo managed workflow,
// the backend whisper service is the primary path. This is the offline fallback.

import { LegalResponse } from '../types/crisis';

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  isOffline: boolean;
}

/**
 * Transcribes audio using on-device model (offline fallback).
 * In Expo managed workflow, this returns a placeholder.
 * Full implementation requires expo-dev-client + native whisper binding.
 */
export const transcribeOffline = async (
  audioUri: string,
  languageHint?: string
): Promise<TranscriptionResult> => {
  // Placeholder — in production, integrate react-native-whisper or ONNX runtime
  console.warn('[whisper.ts] On-device transcription not available in managed workflow.');
  return {
    text: '',
    language: languageHint ?? 'en',
    confidence: 0,
    isOffline: true,
  };
};

/**
 * Returns whether on-device Whisper is available on this device.
 * Returns false in managed Expo workflow.
 */
export const isWhisperAvailable = (): boolean => {
  return false; // Enable when using custom dev client
};
