"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LandingAuthActions } from "@/components/landing/LandingAuthActions";
import { LandingLogoIcon } from "@/components/landing/LandingLogoIcon";
import { Box } from "@/components/ui/box";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SectionId = "features" | "how-it-works" | "about" | "faq" | "contact";

const landingNav: { href: string; id: SectionId; label: string }[] = [
  { href: "#features", id: "features", label: t("LANDING_NAV_FEATURES") },
  { href: "#how-it-works", id: "how-it-works", label: t("LANDING_NAV_HOW_IT_WORKS") },
  { href: "#about", id: "about", label: t("LANDING_NAV_ABOUT") },
  { href: "#faq", id: "faq", label: t("LANDING_NAV_FAQ") },
  { href: "/contact", id: "contact", label: t("LANDING_NAV_CONTACT") },
];

const LandingHeaderNav = () => {
  const [activeId, setActiveId] = useState<SectionId>("features");

  useEffect(() => {
    const ids = landingNav.map((n) => n.id);

    const updateActive = () => {
      // Document Y where we consider "current" section (below sticky header + scroll-margin)
      const headerReserve = 100;
      const scrollLine = window.scrollY + headerReserve;
      let current: SectionId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= scrollLine) current = id;
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, []);

  return (
    <Box
      as="nav"
      aria-label={t("LANDING_HEADER_NAV_ARIA")}
      className={cn(
        "hidden min-w-0 max-w-[min(100%,36rem)] flex-1 justify-center md:flex",
        "rounded-full border border-white/60 bg-gradient-to-b from-white/75 to-white/55 p-1 shadow-md shadow-slate-900/10 backdrop-blur-xl",
        "ring-1 ring-slate-200/60"
      )}
    >
      <ul className="flex min-w-0 flex-wrap items-center justify-center gap-0.5 sm:flex-nowrap sm:gap-0.5">
        {landingNav.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "relative block whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 sm:px-3.5 sm:text-xs",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-slate-600 hover:bg-white/85 hover:text-slate-900 hover:shadow-sm"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </Box>
  );
};

export const LandingHeader = () => (
  <Box
    as="header"
    className={cn(
      "sticky top-0 z-[100] w-full border-b border-white/50",
      "bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur-2xl",
      "supports-[backdrop-filter]:bg-white/55"
    )}
  >
    <Box className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
      <Link
        href="/"
        className="relative flex h-full max-h-full shrink-0 items-center transition-opacity hover:opacity-90"
        aria-label={t("LANDING_HEADER_LOGO_ALT")}
      >
        <LandingLogoIcon />
      </Link>

      <LandingHeaderNav />

      <Box className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <LandingAuthActions variant="header" />
      </Box>
    </Box>
  </Box>
);
