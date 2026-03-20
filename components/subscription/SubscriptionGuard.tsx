"use client";

import { useEffect, useCallback } from "react";
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

  const checkSubscription = useCallback(async () => {
    if (!hostelId) return;
    try {
      const res = await fetchWithHostel("/api/subscription/status", hostelId);
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch {
      setStatus(null);
    }
  }, [hostelId, setStatus]);

  useEffect(() => {
    if (!hostelId) return;
    checkSubscription();
  }, [hostelId, checkSubscription]);

  useEffect(() => {
    if (hostelId || pathname === SUBSCRIPTION_PAGE_PATH) return;
    if (!status && shouldRedirectToSubscription(status)) {
      router.replace(SUBSCRIPTION_PAGE_PATH);
    }
  }, [hostelId, pathname, status, router]);

  return <>{children}</>;
}
