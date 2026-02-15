import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
}

interface SettingsState {
  name: string;
  email: string;
  setProfile: (name: string, email: string) => void;
  notifications: NotificationSettings;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: "Administrator",
      email: "admin@hostel.com",
      setProfile: (name, email) => set({ name, email }),
      notifications: {
        emailNotifications: true,
        paymentReminders: true,
      },
      setNotifications: (settings) =>
        set((s) => ({ notifications: { ...s.notifications, ...settings } })),
    }),
    { name: "hostelhub-settings" }
  )
);
