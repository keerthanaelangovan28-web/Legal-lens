import { create } from 'zustand';
import { Jurisdiction } from '../types/crisis';

export interface EmergencyContact {
  name: string;
  phone: string;
}

interface UserState {
  preferredLanguage: string;
  jurisdiction: Jurisdiction | null;
  profileComplete: boolean;
  emergencyContacts: EmergencyContact[];
  privacySettings: {
    autoStartRecording: boolean;
    saveCrisisHistory: boolean;
  };
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  setPreferredLanguage: (lang: string) => void;
  setJurisdiction: (jurisdiction: Jurisdiction) => void;
  setProfileComplete: (complete: boolean) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (index: number) => void;
  updateEmergencyContact: (index: number, contact: EmergencyContact) => void;
  setPrivacySettings: (settings: Partial<UserState['privacySettings']>) => void;
  clearHistory: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  preferredLanguage: 'en',
  jurisdiction: null,
  profileComplete: false,
  emergencyContacts: [],
  privacySettings: {
    autoStartRecording: false,
    saveCrisisHistory: true,
  },
  demoMode: false,
  setDemoMode: (demoMode) => set({ demoMode }),
  setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setProfileComplete: (profileComplete) => set({ profileComplete }),
  addEmergencyContact: (contact) => set((state) => ({
    emergencyContacts: [...state.emergencyContacts, contact].slice(0, 3)
  })),
  removeEmergencyContact: (index) => set((state) => ({
    emergencyContacts: state.emergencyContacts.filter((_, i) => i !== index)
  })),
  updateEmergencyContact: (index, contact) => set((state) => ({
    emergencyContacts: state.emergencyContacts.map((c, i) => i === index ? contact : c)
  })),
  setPrivacySettings: (settings) => set((state) => ({
    privacySettings: { ...state.privacySettings, ...settings }
  })),
  clearHistory: () => {
    // This will be handled in the crisisStore or by the caller
  },
}));
