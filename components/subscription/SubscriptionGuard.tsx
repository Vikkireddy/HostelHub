"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { useSubscriptionStore, shouldRedirectToSubscription } from "@/lib/SubscriptionStore";
import { SUBSCRIPTION_PAGE_PATH } from "@/lib/subscription/constants";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const { status, setStatus } = useSubscriptionStore();
  const [hasChecked, setHasChecked] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!hostelId) return;
    try {
      const res = await fetchWithHostel("/api/subscription/status", hostelId);
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      } else {
        setStatus(null);
      }
    } catch {
      setStatus(null);
    } finally {
      setHasChecked(true);
    }
  }, [hostelId, setStatus]);

  useEffect(() => {
    if (!hostelId) return;
    checkSubscription();
  }, [hostelId, checkSubscription]);

  useEffect(() => {
    if (!hostelId) return;
    if (pathname === SUBSCRIPTION_PAGE_PATH) return;
    if (!hasChecked) return;
    if (shouldRedirectToSubscription(status)) {
      router.replace(SUBSCRIPTION_PAGE_PATH);
    }
  }, [hostelId, pathname, status, router, hasChecked]);

  return <>{children}</>;
}
