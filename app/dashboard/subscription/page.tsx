"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription/constants";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const { setStatus } = useSubscriptionStore();
  const [activating, setActivating] = useState<string | null>(null);
  const [status, setStatusLocal] = useState<{
    hasActiveSubscription: boolean;
    expiresAt: string | null;
    bannerType?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!hostelId) return;
    fetchWithHostel("/api/subscription/status", hostelId)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus(data);
          setStatusLocal({
            hasActiveSubscription: data.hasActiveSubscription,
            expiresAt: data.expiresAt,
            bannerType: data.bannerType,
          });
        }
      })
      .catch(() => setStatusLocal({ hasActiveSubscription: false, expiresAt: null }));
  }, [hostelId, setStatus]);

  const openRazorpayCheckout = useCallback(
    async (planId: string) => {
      if (!hostelId || !window.Razorpay) return;
      setActivating(planId);
      try {
        const orderRes = await fetchWithHostel("/api/subscription/create-order", hostelId, {
          method: "POST",
          body: JSON.stringify({ planId }),
        });
        const orderData = await orderRes.json();
        if (!orderData.success) {
          toast.error(orderData.message || "Failed to create order");
          setActivating(null);
          return;
        }

        const { orderId, amount, currency, keyId, planName } = orderData;
        const user = useAuthStore.getState().user;

        const options: RazorpayOptions & { modal?: { ondismiss?: () => void } } = {
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "HostelHub",
          description: `${planName} Plan - Monthly Subscription`,
          prefill: {
            name: user?.name ?? undefined,
            email: user?.email ?? undefined,
          },
          theme: { color: "#18222e" },
          modal: {
            ondismiss: () => setActivating(null),
          },
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              const verifyRes = await fetchWithHostel("/api/subscription/verify-payment", hostelId, {
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setStatus({
                  hasActiveSubscription: true,
                  status: "active",
                  planId,
                  planName: SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name ?? null,
                  expiresAt: verifyData.expiresAt,
                  gracePeriodEndsAt: null,
                  trialEndsAt: null,
                  isInGracePeriod: false,
                  isTrial: false,
                  isPaymentFailed: false,
                  isOwner: true,
                  bannerType: null,
                });
                toast.success("Payment successful! Subscription activated.");
                router.push("/dashboard");
              } else {
                toast.error(verifyData.message || "Payment verification failed");
              }
            } catch {
              toast.error("Failed to verify payment. Please contact support.");
            } finally {
              setActivating(null);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Please try again.");
          setActivating(null);
        });
        rzp.open();
      } catch {
        toast.error("Failed to open payment. Please try again.");
        setActivating(null);
      }
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
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Razorpay script loaded - window.Razorpay is now available
        }}
      />
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
          <Typography className="text-sm text-red-800">
            {status.bannerType === "subscription_expired" && status.expiresAt
              ? `Your subscription expired on ${new Date(status.expiresAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}. Please renew to continue using HostelHub.`
              : status.bannerType === "payment_failed"
                ? "Your subscription payment failed. Please retry payment to continue."
                : status.bannerType === "trial_expired"
                  ? "Your trial has ended. Please choose a plan to continue using HostelHub."
                  : "Please choose a subscription plan to continue using HostelHub."}
          </Typography>
          <Button size="sm" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
            Renew Now
          </Button>
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
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col",
              plan.id === "pro" && "ring-2 ring-primary shadow-lg"
            )}
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
                  onClick={handleContactSales}
                >
                  Contact Sales
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
        ))}
      </Box>
    </Box>
    </>
  );
}
