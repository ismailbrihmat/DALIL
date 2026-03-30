import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  country: string;
  city: string;
  password: string; // In real app, this would be hashed
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[]; // Simple local storage of users
  
  // Actions
  register: (username: string, country: string, city: string, password: string) => { success: boolean; error?: string };
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  getCurrentUserCountry: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [],

      register: (username: string, country: string, city: string, password: string) => {
        const { users } = get();
        
        // Validate inputs
        if (!username || username.length < 3) {
          return { success: false, error: 'Username must be at least 3 characters' };
        }
        if (!country) {
          return { success: false, error: 'Please select your country' };
        }
        if (!city) {
          return { success: false, error: 'Please select your city' };
        }
        if (!password || password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Check if username already exists
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          return { success: false, error: 'Username already exists' };
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          username,
          country,
          city,
          password, // Note: In production, hash this!
        };

        set({
          users: [...users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        });

        return { success: true };
      },

      login: (username: string, password: string) => {
        const { users } = get();
        
        if (!username || !password) {
          return { success: false, error: 'Please enter username and password' };
        }

        const user = users.find(
          u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (!user) {
          return { success: false, error: 'Invalid username or password' };
        }

        set({
          currentUser: user,
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      getCurrentUserCountry: () => {
        const { currentUser } = get();
        return currentUser?.country || null;
      },
    }),
    {
      name: 'dalil-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
