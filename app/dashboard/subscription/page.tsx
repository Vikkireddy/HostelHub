"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { fetchWithHostel } from "@/lib/ApiClient";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { t } from "@/lib/i18n";
import { PLAN_COMPARISON_ROWS, SUBSCRIPTION_PLANS } from "@/lib/subscription/constants";
import { startRazorpayCheckout } from "@/lib/subscription/startRazorpayCheckout";
import type { SubscriptionStatusResponse } from "@/lib/subscription/types";
import {
  PlanComparisonCard,
  PricingHero,
  PricingPlansGrid,
  SubscriptionCtaCard,
  SubscriptionStatusCards,
  type SubscriptionPageStatus,
} from "./components";

function scrollToPlans(): void {
  document.getElementById("pricing-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canSubscriptionEdit = hasDashboardPermission(user, "subscription", "edit");
  const { setStatus } = useSubscriptionStore();
  const [activating, setActivating] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);
  const [status, setStatusLocal] = useState<SubscriptionPageStatus | null>(null);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status", hostelId],
    enabled: Boolean(hostelId),
    queryFn: () => fetchWithHostel("/api/subscription/status", hostelId).then((r) => r.json()),
  });

  useEffect(() => {
    if (!subscriptionStatus) return;
    if (subscriptionStatus.success) {
      const nextStatus: SubscriptionStatusResponse = {
        hasActiveSubscription: subscriptionStatus.hasActiveSubscription,
        status: subscriptionStatus.status,
        planId: subscriptionStatus.planId,
        planName: subscriptionStatus.planName,
        expiresAt: subscriptionStatus.expiresAt,
        gracePeriodEndsAt: subscriptionStatus.gracePeriodEndsAt,
        trialEndsAt: subscriptionStatus.trialEndsAt,
        isInGracePeriod: subscriptionStatus.isInGracePeriod,
        isTrial: subscriptionStatus.isTrial,
        isPaymentFailed: subscriptionStatus.isPaymentFailed,
        isOwner: subscriptionStatus.isOwner,
        bannerType: subscriptionStatus.bannerType,
      };
      setStatus(nextStatus);
      setStatusLocal({
        hasActiveSubscription: nextStatus.hasActiveSubscription,
        expiresAt: nextStatus.expiresAt,
        bannerType: nextStatus.bannerType,
        trialEndsAt: nextStatus.trialEndsAt,
        isTrial: nextStatus.isTrial,
        planName: nextStatus.planName,
      });
      return;
    }
    setStatusLocal(null);
  }, [subscriptionStatus, setStatus]);

  const startFreeTrial = async () => {
    if (!hostelId || !canSubscriptionEdit) return;
    try {
      setStartingTrial(true);
      const res = await fetchWithHostel("/api/subscription/start-trial", hostelId, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || t("SUBSCRIPTION_TRIAL_START_FAILED"));
        return;
      }

      const trialEndsAtIso = data.trialEndsAt as string | undefined;
      setStatus({
        hasActiveSubscription: true,
        status: "trial",
        planId: data.planId ?? "basic",
        planName: data.planName ?? "Base",
        expiresAt: null,
        gracePeriodEndsAt: null,
        trialEndsAt: trialEndsAtIso ?? null,
        isInGracePeriod: false,
        isTrial: true,
        isPaymentFailed: false,
        isOwner: true,
        bannerType: null,
      });
      toast.success(t("SUBSCRIPTION_TRIAL_START_SUCCESS"));
      router.push("/dashboard");
    } catch {
      toast.error(t("SUBSCRIPTION_TRIAL_START_ERROR"));
    } finally {
      setStartingTrial(false);
    }
  };

  const openRazorpayCheckout = useCallback(
    async (planId: string) => {
      if (!hostelId || !canSubscriptionEdit) return;
      setActivating(planId);
      const user = useAuthStore.getState().user;
      await startRazorpayCheckout(planId, hostelId, {
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        },
        onDismiss: () => setActivating(null),
        onOrderFailed: (message) => {
          toast.error(message);
          setActivating(null);
        },
        onVerifyFailed: (message) => {
          toast.error(message);
          setActivating(null);
        },
        onPaymentFailed: () => {
          toast.error(t("SUBSCRIPTION_PAYMENT_FAILED"));
          setActivating(null);
        },
        onPaid: async ({ expiresAt }) => {
          setStatus({
            hasActiveSubscription: true,
            status: "active",
            planId,
            planName: SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name ?? null,
            expiresAt,
            gracePeriodEndsAt: null,
            trialEndsAt: null,
            isInGracePeriod: false,
            isTrial: false,
            isPaymentFailed: false,
            isOwner: true,
            bannerType: null,
          });
          toast.success(t("PAYMENT_SUCCESS"));
          router.push("/dashboard");
          setActivating(null);
        },
      });
    },
    [hostelId, router, setStatus, canSubscriptionEdit]
  );

  const formatExpiryDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const showExpiredBanner =
    status &&
    !status.hasActiveSubscription &&
    (status.bannerType === "subscription_expired" ||
      status.bannerType === "subscription_required" ||
      status.bannerType === "trial_expired" ||
      status.bannerType === "payment_failed");

  const paidActive = Boolean(status?.hasActiveSubscription && !status?.isTrial);
  const trialActive = Boolean(status?.hasActiveSubscription && status?.isTrial);

  return (
    <Box className="-mx-8 -mt-8">
      <PricingHero />
      <Box className="relative z-[1] -mt-20 px-4 sm:px-8">
        <PricingPlansGrid
          plans={SUBSCRIPTION_PLANS}
          activating={activating}
          onCheckout={openRazorpayCheckout}
          canPurchase={canSubscriptionEdit}
        />

        <SubscriptionStatusCards
          status={status}
          showExpiredBanner={Boolean(showExpiredBanner)}
          trialActive={trialActive}
          paidActive={paidActive}
          formatDate={formatExpiryDate}
          onViewPlans={scrollToPlans}
        />

        <PlanComparisonCard rows={PLAN_COMPARISON_ROWS} />

        <SubscriptionCtaCard
          paidActive={paidActive}
          trialActive={trialActive}
          startingTrial={startingTrial}
          onStartTrial={startFreeTrial}
          onComparePlans={scrollToPlans}
          canStartTrial={canSubscriptionEdit}
        />
      </Box>
    </Box>
  );
}
