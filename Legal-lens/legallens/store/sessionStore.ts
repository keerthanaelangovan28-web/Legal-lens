import { create } from 'zustand';
import { CrisisSession, LegalResponse, CrisisType, Jurisdiction } from '../types/crisis';

interface SessionState {
  sessions: CrisisSession[];
  currentSessionId: string | null;
  addSession: (session: CrisisSession) => void;
  updateSession: (id: string, updates: Partial<CrisisSession>) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
  setCurrentSession: (id: string | null) => void;
  getSession: (id: string) => CrisisSession | undefined;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  deleteSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),

  clearHistory: () => set({ sessions: [], currentSessionId: null }),

  setCurrentSession: (id) => set({ currentSessionId: id }),

  getSession: (id) => get().sessions.find((s) => s.id === id),
}));
