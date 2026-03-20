import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "@/lib/SettingsStore";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";

interface AuthState {
  user: { email: string; name: string; hostelId: number | null } | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: { name?: string; email?: string }) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: async (emailOrPhone: string, password: string) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailOrPhone, password }),
          });
          const data = await res.json();
          if (data.success && data.user) {
            set({
              user: {
                email: data.user.email,
                name: data.user.name,
                hostelId: data.user.hostelId ?? null,
              },
              isAuthenticated: true,
              _hasHydrated: true,
            });
            useSettingsStore.getState().setProfile(data.user.name, data.user.email);
            useSubscriptionStore.getState().reset();
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        useSettingsStore.getState().setProfile("Administrator", "admin@hostel.com");
        useSubscriptionStore.getState().reset();
      },
      updateUser: (updates) =>
        set((s) => {
          if (!s.user) return s;
          const next = { ...s.user, ...updates };
          return { user: next };
        }),
    }),
    {
      name: "hostelhub-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        useAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);
