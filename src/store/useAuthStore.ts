import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'creator' | 'advertiser' | 'admin' | null;

interface AuthState {
  user: FirebaseUser | null;
  role: UserRole;
  profile: any | null;
  isAuthReady: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setRole: (role: UserRole) => void;
  setProfile: (profile: any) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  profile: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setProfile: (profile) => set({ profile }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  logout: () => set({ user: null, role: null, profile: null }),
}));
