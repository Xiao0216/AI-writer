import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  role: string;
  membershipExpireAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface WorkState {
  currentWorkId: string | null;
  currentChapterId: string | null;
  
  setCurrentWork: (workId: string) => void;
  setCurrentChapter: (chapterId: string) => void;
  clearCurrentWork: () => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  currentWorkId: null,
  currentChapterId: null,
  
  setCurrentWork: (workId) => set({ currentWorkId: workId }),
  
  setCurrentChapter: (chapterId) => set({ currentChapterId: chapterId }),
  
  clearCurrentWork: () => set({ currentWorkId: null, currentChapterId: null }),
}));
