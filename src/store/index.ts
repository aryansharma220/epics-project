import { create } from 'zustand';
import { UserPreferences } from '../types';

interface State {
  preferences: UserPreferences;
  setDarkMode: (isDarkMode: boolean) => void;
  setLanguage: (language: string) => void;
  setLocation: (lat: number, lng: number) => void;
}

export const useStore = create<State>((set) => ({
  preferences: {
    isDarkMode: false,
    language: 'en',
    location: {
      lat: 20.5937,
      lng: 78.9629,
    },
  },
  setDarkMode: (isDarkMode) =>
    set((state) => ({
      preferences: { ...state.preferences, isDarkMode },
    })),
  setLanguage: (language) =>
    set((state) => ({
      preferences: { ...state.preferences, language },
    })),
  setLocation: (lat, lng) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        location: { lat, lng },
      },
    })),
}));