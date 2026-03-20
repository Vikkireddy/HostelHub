import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubscriptionStatusResponse, SubscriptionBannerType } from "./subscription/types";

interface SubscriptionState {
  status: SubscriptionStatusResponse | null;
  lastChecked: number | null;
  bannerDismissed: boolean;
  setStatus: (status: SubscriptionStatusResponse | null) => void;
  setBannerDismissed: (dismissed: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      status: null,
      lastChecked: null,
      bannerDismissed: false,
      setStatus: (status) =>
        set({
          status,
          lastChecked: status ? Date.now() : null,
          bannerDismissed: false,
        }),
      setBannerDismissed: (dismissed) => set({ bannerDismissed: dismissed }),
      reset: () =>
        set({
          status: null,
          lastChecked: null,
          bannerDismissed: false,
        }),
    }),
    { name: "hostelhub-subscription" }
  )
);

//  import { BYPASS_SUBSCRIPTION_CHECK } from "./subscription/constants";

export function shouldRedirectToSubscription(status: SubscriptionStatusResponse | null): boolean {
  // if (BYPASS_SUBSCRIPTION_CHECK) return false;
  if (!status) return true;
  if (status.hasActiveSubscription && !status.isPaymentFailed) return false;
  return true;
}

export function getBannerType(status: SubscriptionStatusResponse | null): SubscriptionBannerType | null {
  if (!status) return "subscription_required";
  return status.bannerType ?? (status.hasActiveSubscription ? null : "subscription_expired");
}
