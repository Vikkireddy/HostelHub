import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: { email: string; name: string; hostelId: number | null } | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
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
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "hostelhub-auth" }
  )
);
