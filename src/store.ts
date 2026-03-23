import { create } from 'zustand';

export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Malayalam';

interface LegalRights {
  rights: string[];
  scriptedPhrase: string;
  section: string;
}

interface AppState {
  language: Language;
  isRecording: boolean;
  isProcessing: boolean;
  result: LegalRights | null;
  setLanguage: (lang: Language) => void;
  startRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
  setResult: (result: LegalRights) => void;
}

export const useStore = create<AppState>((set) => ({
  language: 'English',
  isRecording: false,
  isProcessing: false,
  result: null,
  setLanguage: (language) => set({ language }),
  startRecording: () => set({ isRecording: true, result: null }),
  stopRecording: () => set({ isRecording: false, isProcessing: true }),
  reset: () => set({ result: null, isProcessing: false, isRecording: false }),
  setResult: (result) => set({ result, isProcessing: false }),
}));
