import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/schema';
import { getPermissions, hasPermission, type Role, type Permission } from '@shared/permissions';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  // Permission helpers
  getPermissions: () => Permission | null;
  hasPermission: (permission: keyof Permission) => boolean;
  canAccess: (feature: keyof Permission) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      
      // Permission helpers
      getPermissions: () => {
        const { user } = get();
        return user ? getPermissions(user.role as Role) : null;
      },
      
      hasPermission: (permission: keyof Permission) => {
        const { user } = get();
        return user ? hasPermission(user.role as Role, permission) : false;
      },
      
      canAccess: (feature: keyof Permission) => {
        const { user } = get();
        return user ? hasPermission(user.role as Role, feature) : false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
