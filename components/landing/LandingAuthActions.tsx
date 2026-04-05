"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const primaryCta =
  "inline-flex items-center justify-center gap-2 bg-primary font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const outlineCta =
  "inline-flex items-center justify-center gap-2 border border-input bg-background font-semibold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

type Variant = "header" | "hero-secondary" | "hero-primary";

export const LandingAuthActions = ({ variant }: { variant: Variant }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    const finish = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    const fallback = window.setTimeout(() => {
      if (!useAuthStore.getState()._hasHydrated) {
        setHasHydrated(true);
      }
    }, 400);
    return () => {
      finish();
      window.clearTimeout(fallback);
    };
  }, [setHasHydrated]);

  const showAuthedUi = _hasHydrated && isAuthenticated;

  if (showAuthedUi) {
    if (variant === "hero-secondary") {
      return null;
    }
    if (variant === "header") {
      return (
        <Link
          href="/dashboard"
          className={cn(
            primaryCta,
            "rounded-md px-4 py-2 text-sm [&_svg]:size-4"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("DASHBOARD")}
        </Link>
      );
    }
    if (variant === "hero-primary") {
      return (
        <Link
          href="/dashboard"
          className={cn(
            primaryCta,
            "h-12 w-full max-w-xs rounded-md px-8 text-base sm:w-auto [&_svg]:size-5"
          )}
        >
          {t("LANDING_AUTH_GO_TO_DASHBOARD")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }
    return (
      <Link
        href="/dashboard"
        className={cn(
          outlineCta,
          "h-12 w-full max-w-xs rounded-md px-8 text-base sm:w-auto"
        )}
      >
        {t("DASHBOARD")}
      </Link>
    );
  }

  if (variant === "header") {
    return (
      <>
        <Link
          href="/login"
          className="text-sm font-medium text-link underline-offset-4 hover:underline"
        >
          {t("LANDING_AUTH_SIGN_IN")}
        </Link>
        <Link href="/signup" className={cn(primaryCta, "rounded-md px-4 py-2 text-sm")}>
          {t("LANDING_AUTH_GET_STARTED")}
        </Link>
      </>
    );
  }

  if (variant === "hero-primary") {
    return (
      <Link
        href="/signup"
        className={cn(
          primaryCta,
          "h-12 w-full max-w-xs rounded-md px-8 text-base sm:w-auto [&_svg]:size-5"
        )}
      >
        {t("LANDING_AUTH_START_FREE_TRIAL")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        outlineCta,
        "h-12 w-full max-w-xs rounded-md px-8 text-base sm:w-auto"
      )}
    >
      {t("LANDING_AUTH_SIGN_IN")}
    </Link>
  );
};
