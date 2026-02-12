import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: { email: string; name: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        if (email === "admin@hostel.com" && password === "admin123") {
          set({ user: { email, name: "Admin" }, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "hostelhub-auth" }
  )
);
