import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCrisisStore } from '../store/crisisStore';
import { useUserStore } from '../store/userStore';
import { api } from '../services/api';
import { LegalResponse } from '../types/crisis';

const SILENCE_THRESHOLD_SECONDS = 3;
const MAX_RECORDING_SECONDS = 30;

interface UseVoiceInputReturn {
  isRecording: boolean;
  transcription: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

export const useVoiceInput = (
  onResult: (response: LegalResponse) => void
): UseVoiceInputReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setIsRecording: setStoreRecording, setIsProcessing } = useCrisisStore();
  const { preferredLanguage, jurisdiction } = useUserStore();

  const clearTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
  };

  const submitAudio = useCallback(
    async (uri: string) => {
      setIsProcessing(true);
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const formData = new FormData();
        // @ts-ignore
        formData.append('audio_file', {
          uri,
          name: 'recording.m4a',
          type: 'audio/m4a',
        });
        formData.append('language', preferredLanguage);
        formData.append('latitude', String(jurisdiction?.latitude ?? 0));
        formData.append('longitude', String(jurisdiction?.longitude ?? 0));

        const response = await api.post<LegalResponse>('/crisis/voice', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000,
        });
        onResult(response.data);
      } catch (err: any) {
        setError('Could not process your voice. Try again or type your situation.');
      } finally {
        setIsProcessing(false);
      }
    },
    [preferredLanguage, jurisdiction, onResult, setIsProcessing]
  );

  const startRecording = async () => {
    setError(null);
    setTranscription('');
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission is required.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setStoreRecording(true);

      // Auto stop after max duration
      maxTimerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_SECONDS * 1000);

      // Silence detection — poll metering every 500ms
      const silenceCheck = setInterval(async () => {
        if (!recordingRef.current) {
          clearInterval(silenceCheck);
          return;
        }
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          // metering < -50 dB indicates silence
          if (status.metering < -50) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                clearInterval(silenceCheck);
                stopRecording();
              }, SILENCE_THRESHOLD_SECONDS * 1000);
            }
          } else {
            // Sound detected — reset silence timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          }
        }
      }, 500);
    } catch (err) {
      setError('Could not start recording. Check microphone permissions.');
      setIsRecording(false);
      setStoreRecording(false);
    }
  };

  const stopRecording = async () => {
    clearTimers();
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      setStoreRecording(false);
      if (uri) {
        await submitAudio(uri);
      }
    } catch (err) {
      setError('Recording stopped unexpectedly.');
      setIsRecording(false);
      setStoreRecording(false);
    }
  };

  return { isRecording, transcription, startRecording, stopRecording, error };
};
