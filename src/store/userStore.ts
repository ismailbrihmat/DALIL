/**
 * User Store
 * 
 * Manages user preferences, authentication state, and notification settings.
 * Persists data across app sessions using AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  language: 'en' | 'fr' | 'ar';
  currency: 'MAD' | 'USD' | 'EUR';
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

interface UserState {
  // User identity
  userId: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
  
  // Preferences
  preferences: UserPreferences;
  
  // Notification tokens
  pushToken: string | null;
  
  // Actions
  setUser: (user: { userId: string; email: string; name: string }) => void;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setPushToken: (token: string) => void;
  
  // Getters
  getEffectiveLanguage: () => string;
}

const initialPreferences: UserPreferences = {
  language: 'en',
  currency: 'MAD',
  notificationsEnabled: true,
  theme: 'light',
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      email: null,
      name: null,
      isAuthenticated: false,
      preferences: initialPreferences,
      pushToken: null,

      setUser: (user) =>
        set({
          userId: user.userId,
          email: user.email,
          name: user.name,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          userId: null,
          email: null,
          name: null,
          isAuthenticated: false,
          pushToken: null,
        }),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setPushToken: (token) => set({ pushToken: token }),

      getEffectiveLanguage: () => {
        const { preferences } = get();
        return preferences.language;
      },
    }),
    {
      name: 'dalil-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
