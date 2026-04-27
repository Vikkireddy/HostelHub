import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "@/lib/SettingsStore";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import type { PermissionsMatrix } from "@/lib/permissionMatrix";

export type AccessibleHostelSummary = {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
};

export type AuthUser = {
  email: string;
  name: string;
  hostelId: number | null;
  adminId?: number;
  isOwner?: boolean;
  canManageUsersAndRoles?: boolean;
  roleId?: number | null;
  roleName?: string | null;
  /** `single` (default) or `multi` portfolio owner. */
  managementMode?: "single" | "multi";
  /** Properties linked to this account (owner: portfolio; staff: assigned only). */
  accessibleHostels?: AccessibleHostelSummary[];
  /** Effective CRUD matrix; omitted on legacy persisted sessions until next login. */
  permissions?: PermissionsMatrix;
};

export type LoginResult = {
  success: boolean;
  message?: string;
  managementMode?: "single" | "multi";
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<LoginResult>;
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
            const assigned = u.accessibleHostels ?? [];
            const resolvedHostelId =
              u.hostelId ?? (!u.isOwner && assigned.length > 0 ? assigned[0].id : null);
            set({
              user: {
                email: u.email,
                name: u.name,
                hostelId: resolvedHostelId,
                adminId: u.adminId,
                isOwner: u.isOwner,
                canManageUsersAndRoles: u.canManageUsersAndRoles,
                roleId: u.roleId ?? null,
                roleName: u.roleName ?? null,
                managementMode: u.managementMode ?? "single",
                accessibleHostels: assigned,
                permissions: (u as AuthUser).permissions,
              },
              isAuthenticated: true,
              _hasHydrated: true,
            });
            useSettingsStore.getState().setProfile(data.user.name, data.user.email);
            useSubscriptionStore.getState().reset();
            return {
              success: true,
              managementMode: u.managementMode ?? "single",
            };
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
        const u = state?.user;
        if (!u || u.isOwner) return;
        const assigned = u.accessibleHostels ?? [];
        if (assigned.length === 0) return;
        if (u.hostelId == null || !assigned.some((h) => h.id === u.hostelId)) {
          useAuthStore.getState().updateUser({ hostelId: assigned[0].id });
        }
      },
    }
  )
);
