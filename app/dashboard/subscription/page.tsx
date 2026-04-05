"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import {
  ENTERPRISE_SUBSCRIPTION_ENABLED,
  SUBSCRIPTION_PLANS,
} from "@/lib/subscription/constants";
import { startRazorpayCheckout } from "@/lib/subscription/startRazorpayCheckout";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

export default function SubscriptionPage() {
  const router = useRouter();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const { setStatus } = useSubscriptionStore();
  const [activating, setActivating] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);
  /** Visual highlight: Pro by default; hovered plan while pointer is on that card */
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const highlightedPlanId = hoveredPlanId ?? "pro";
  const [status, setStatusLocal] = useState<{
    hasActiveSubscription: boolean;
    expiresAt: string | null;
    bannerType?: string | null;
    trialEndsAt?: string | null;
    isTrial?: boolean;
    planName?: string | null;
  } | null>(null);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status", hostelId],
    enabled: Boolean(hostelId),
    queryFn: () =>
      fetchWithHostel("/api/subscription/status", hostelId).then((r) => r.json()),
  });

  useEffect(() => {
    if (!subscriptionStatus) return;
    if (subscriptionStatus.success) {
      setStatus(subscriptionStatus);
      setStatusLocal({
        hasActiveSubscription: subscriptionStatus.hasActiveSubscription,
        expiresAt: subscriptionStatus.expiresAt,
        bannerType: subscriptionStatus.bannerType,
        trialEndsAt: subscriptionStatus.trialEndsAt,
        isTrial: subscriptionStatus.isTrial,
        planName: subscriptionStatus.planName,
      });
      return;
    }
    setStatusLocal({
      hasActiveSubscription: false,
      expiresAt: null,
      trialEndsAt: null,
      isTrial: false,
      planName: null,
      bannerType: null,
    });
  }, [subscriptionStatus, setStatus]);

  const startFreeTrial = async () => {
    if (!hostelId) return;
    try {
      setStartingTrial(true);
      const res = await fetchWithHostel("/api/subscription/start-trial", hostelId, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed to start trial");
        return;
      }

      const trialEndsAtIso = data.trialEndsAt as string | undefined;
      setStatus({
        hasActiveSubscription: true,
        status: "trial",
        planId: data.planId ?? "basic",
        planName: data.planName ?? "Basic",
        expiresAt: null,
        gracePeriodEndsAt: null,
        trialEndsAt: trialEndsAtIso ?? null,
        isInGracePeriod: false,
        isTrial: true,
        isPaymentFailed: false,
        isOwner: true,
        bannerType: null,
      });

      router.push("/dashboard");
    } catch {
      toast.error("Failed to start trial. Please try again.");
    } finally {
      setStartingTrial(false);
    }
  };

  const openRazorpayCheckout = useCallback(
    async (planId: string) => {
      if (!hostelId) return;
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
          toast.error("Payment failed. Please try again.");
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
    [hostelId, router, setStatus]
  );

  const handleContactSales = () => {
    window.location.href = "";
  };

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

  return (
    <>
      <Box className="space-y-8">
      <Box>
        <Typography variant="large" as="div" className="text-2xl font-bold text-slate-900">
          Upgrade Your Plan
        </Typography>
        <Typography className="mt-1 text-slate-600">
          Choose the best plan for your hostel size
        </Typography>
      </Box>

      {showExpiredBanner && (
        <Box className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <Box className="min-w-0">
            <Typography className="text-sm text-red-800">
              {status.bannerType === "subscription_required"
                ? "Start your 7-day free trial to unlock the full dashboard experience."
                : status.bannerType === "subscription_expired" && status.expiresAt
                  ? `Your subscription expired on ${new Date(status.expiresAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}. Please renew to continue using Admin HostelHub.`
                  : status.bannerType === "payment_failed"
                    ? "Your subscription payment failed. Please retry payment to continue."
                    : status.bannerType === "trial_expired"
                      ? "Your trial has ended. Please choose a plan to continue using Admin HostelHub."
                      : "Please choose a subscription plan to continue using Admin HostelHub."}
            </Typography>
          </Box>
          {status.bannerType === "subscription_required" ? (
            <Button size="sm" onClick={startFreeTrial} disabled={startingTrial}>
              {startingTrial ? "Starting..." : "Start 7-day Trial"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Renew Now
            </Button>
          )}
        </Box>
      )}

      {status?.hasActiveSubscription && status.expiresAt && !showExpiredBanner && (
        <Box className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Typography className="text-sm text-emerald-800">
            Your subscription is active. Renews on {formatExpiryDate(status.expiresAt)}.
          </Typography>
        </Box>
      )}

      <Box id="plans" className="grid gap-6 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const enterpriseDisabled =
            plan.id === "enterprise" && !ENTERPRISE_SUBSCRIPTION_ENABLED;
          return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col transition-shadow",
              plan.id === highlightedPlanId && "ring-2 ring-primary shadow-lg",
              enterpriseDisabled && "opacity-60"
            )}
            onMouseEnter={() => {
              if (enterpriseDisabled) return;
              setHoveredPlanId(plan.id);
            }}
            onMouseLeave={() => setHoveredPlanId(null)}
          >
            {plan.id === "pro" && (
              <Box className="absolute -top-3 right-4 rounded bg-primary px-2 py-0.5">
                <Typography className="text-xs font-semibold text-white">
                  MOST POPULAR
                </Typography>
              </Box>
            )}
            <CardHeader>
              <Typography variant="large" as="div" className="text-lg font-semibold">
                {plan.name}
              </Typography>
              <Typography className="text-2xl font-bold text-slate-900">
                ₹{plan.price_monthly.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-slate-500"> /month</span>
              </Typography>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <Box className="space-y-2">
                {plan.features.map((feature) => (
                  <Box key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    <Typography className="text-sm text-slate-600">{feature}</Typography>
                  </Box>
                ))}
              </Box>
              <Box className="mt-6 flex-1" />
              {plan.id === "enterprise" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={enterpriseDisabled}
                  onClick={handleContactSales}
                >
                  {enterpriseDisabled ? "Coming soon" : "Contact Sales"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => openRazorpayCheckout(plan.id)}
                  loading={activating === plan.id}
                  disabled={!!activating}
                >
                  Choose Plan
                </Button>
              )}
            </CardContent>
          </Card>
          );
        })}
      </Box>
    </Box>
    </>
  );
}
