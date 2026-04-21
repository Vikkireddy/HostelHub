import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
}

export interface HostelBranding {
  hostelName: string;
  hostelLogoUrl: string | null;
}

/** Stable fallback so `getBranding` never returns a fresh object reference each call (avoids Zustand selector infinite re-renders). */
const EMPTY_HOSTEL_BRANDING: HostelBranding = Object.freeze({
  hostelName: "",
  hostelLogoUrl: null,
});

interface SettingsState {
  name: string;
  email: string;
  setProfile: (name: string, email: string) => void;
  notifications: NotificationSettings;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  /** Branding keyed by hostel ID - each hostel has its own name and logo */
  brandingByHostelId: Record<number, HostelBranding>;
  setBranding: (hostelId: number, hostelName: string, hostelLogoUrl: string | null) => void;
  getBranding: (hostelId: number | null) => HostelBranding;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      name: "Administrator",
      email: "admin@hostel.com",
      setProfile: (name, email) => set({ name, email }),
      notifications: {
        emailNotifications: true,
        paymentReminders: true,
      },
      setNotifications: (settings) =>
        set((s) => ({ notifications: { ...s.notifications, ...settings } })),
      brandingByHostelId: {},
      setBranding: (hostelId, hostelName, hostelLogoUrl) =>
        set((s) => ({
          brandingByHostelId: {
            ...s.brandingByHostelId,
            [hostelId]: { hostelName, hostelLogoUrl },
          },
        })),
      getBranding: (hostelId) => {
        if (hostelId == null) return EMPTY_HOSTEL_BRANDING;
        const b = get().brandingByHostelId[hostelId];
        return b ?? EMPTY_HOSTEL_BRANDING;
      },
    }),
    {
      name: "hostelhub-settings",
      version: 1,
      migrate: (persistedState: unknown) => {
        const s = (persistedState ?? {}) as Record<string, unknown>;
        const { hostelName: _hn, hostelLogoUrl: _hl, ...rest } = s;
        return {
          ...rest,
          brandingByHostelId: (s.brandingByHostelId as Record<number, HostelBranding>) ?? {},
        };
      },
    }
  )
);
