import { create } from 'zustand';
import { CrisisType, LegalResponse, CrisisSession } from '../types/crisis';

interface CrisisState {
  activeCrisis: CrisisType | null;
  isRecording: boolean;
  isProcessing: boolean;
  currentResponse: LegalResponse | null;
  sessionHistory: CrisisSession[];
  setActiveCrisis: (type: CrisisType | null) => void;
  setRecording: (recording: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentResponse: (response: LegalResponse | null) => void;
  addToHistory: (session: CrisisSession) => void;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  activeCrisis: null,
  isRecording: false,
  isProcessing: false,
  currentResponse: null,
  sessionHistory: [],
  setActiveCrisis: (activeCrisis) => set({ activeCrisis }),
  setRecording: (isRecording) => set({ isRecording }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setCurrentResponse: (currentResponse) => set({ currentResponse }),
  addToHistory: (session) => set((state) => ({ 
    sessionHistory: [session, ...state.sessionHistory] 
  })),
}));
