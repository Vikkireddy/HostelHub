"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/AuthStore";
import { planLabel, startRazorpayCheckout } from "@/lib/subscription/startRazorpayCheckout";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { isPlanAvailableForPurchase } from "@/lib/subscription/constants";

const VALID_PLANS = new Set(["basic", "pro", "enterprise"]);

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { setStatus } = useSubscriptionStore();

  const [bootError, setBootError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [hasAttemptedLaunch, setHasAttemptedLaunch] = useState(false);
  const startedRef = useRef(false);

  const planOk =
    plan != null &&
    VALID_PLANS.has(plan) &&
    isPlanAvailableForPurchase(plan);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!planOk) {
      router.replace("/");
      return;
    }
    if (!isAuthenticated || hostelId == null) {
      const next = `/subscribe?plan=${encodeURIComponent(plan!)}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [hasHydrated, planOk, isAuthenticated, hostelId, plan, router]);

  const runCheckout = useCallback(async () => {
    if (!planOk || hostelId == null || !plan) return;
    setBootError(null);
    setOpening(true);
    const user = useAuthStore.getState().user;
    await startRazorpayCheckout(plan, hostelId, {
      prefill: {
        name: user?.name ?? undefined,
        email: user?.email ?? undefined,
      },
      onDismiss: () => {
        setOpening(false);
        router.push("/dashboard/subscription");
      },
      onOrderFailed: (message) => {
        setBootError(message);
        toast.error(message);
        setOpening(false);
      },
      onVerifyFailed: (message) => {
        toast.error(message);
        setOpening(false);
      },
      onPaymentFailed: () => {
        toast.error("Payment failed. Please try again.");
        setOpening(false);
      },
      onPaid: async ({ expiresAt }) => {
        setStatus({
          hasActiveSubscription: true,
          status: "active",
          planId: plan,
          planName: planLabel(plan),
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
        setOpening(false);
      },
    });
  }, [plan, planOk, hostelId, router, setStatus]);

  useEffect(() => {
    if (!hasHydrated || !planOk || !isAuthenticated || hostelId == null) return;
    if (startedRef.current) return;
    startedRef.current = true;
    setHasAttemptedLaunch(true);
    void runCheckout();
  }, [hasHydrated, planOk, isAuthenticated, hostelId, runCheckout]);

  if (!planOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Redirecting&hellip;
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Secure checkout</p>
        <p className="mt-2 text-sm text-slate-600">
          {hostelId != null && plan
            ? `Opening Razorpay for the ${planLabel(plan)} plan${opening ? "…" : "."}`
            : "Preparing your session…"}
        </p>
        {bootError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {bootError}
          </p>
        )}
        {(bootError || (hasAttemptedLaunch && !opening && hostelId != null)) && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              onClick={() => {
                startedRef.current = false;
                void runCheckout();
              }}
              disabled={opening || hostelId == null}
            >
              Try again
            </button>
            <Link
              href="/dashboard/subscription"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Subscription page
            </Link>
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">
          <Link href="/" className="font-medium text-primary underline-offset-2 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Loading&hellip;
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
