import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "@/lib/SettingsStore";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import type { PermissionsMatrix } from "@/lib/permissionMatrix";

export type AuthUser = {
  email: string;
  name: string;
  hostelId: number | null;
  adminId?: number;
  isOwner?: boolean;
  canManageUsersAndRoles?: boolean;
  roleId?: number | null;
  roleName?: string | null;
  /** Effective CRUD matrix; omitted on legacy persisted sessions until next login. */
  permissions?: PermissionsMatrix;
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (
    emailOrPhone: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
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
            const u = data.user as AuthUser;
            set({
              user: {
                email: u.email,
                name: u.name,
                hostelId: u.hostelId ?? null,
                adminId: u.adminId,
                isOwner: u.isOwner,
                canManageUsersAndRoles: u.canManageUsersAndRoles,
                roleId: u.roleId ?? null,
                roleName: u.roleName ?? null,
                permissions: (u as AuthUser).permissions,
              },
              isAuthenticated: true,
              _hasHydrated: true,
            });
            useSettingsStore.getState().setProfile(data.user.name, data.user.email);
            useSubscriptionStore.getState().reset();
            return { success: true };
          }
          return {
            success: false,
            message:
              typeof data?.message === "string"
                ? data.message
                : "Invalid email/phone or password. Please try again.",
          };
        } catch {
          return { success: false, message: "Unable to connect to server. Please try again." };
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
