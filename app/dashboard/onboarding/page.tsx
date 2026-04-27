"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy URL: portfolio onboarding now lives on the main dashboard. */
export default function OnboardingRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
