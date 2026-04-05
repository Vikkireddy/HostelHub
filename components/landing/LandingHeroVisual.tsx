"use client";

import Image from "next/image";
import { BarChart3, BedDouble, Users } from "lucide-react";
import { t } from "@/lib/i18n";

const HERO_STILL = "/img/ahh.jpeg";

const DashboardPreviewMock = () => (
  <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md">
    <div
      className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-violet-400/35 blur-2xl"
      aria-hidden
    />
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {t("LANDING_HERO_MOCK_LIVE_OVERVIEW")}
    </p>
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 p-3 ring-1 ring-cyan-500/20 transition-transform duration-500 hover:scale-105">
        <BedDouble className="h-5 w-5 text-cyan-600" />
        <p className="mt-2 text-lg font-bold text-slate-800">24</p>
        <p className="text-[10px] text-slate-600">{t("LANDING_HERO_MOCK_ROOMS")}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-500/5 p-3 ring-1 ring-violet-500/20 transition-transform duration-500 hover:scale-105 [animation-delay:120ms]">
        <Users className="h-5 w-5 text-violet-600" />
        <p className="mt-2 text-lg font-bold text-slate-800">186</p>
        <p className="text-[10px] text-slate-600">{t("LANDING_HERO_MOCK_STUDENTS")}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 p-3 ring-1 ring-amber-500/25 transition-transform duration-500 hover:scale-105 [animation-delay:240ms]">
        <BarChart3 className="h-5 w-5 text-amber-600" />
        <p className="mt-2 text-lg font-bold text-slate-800">94%</p>
        <p className="text-[10px] text-slate-600">{t("LANDING_HERO_MOCK_OCCUPANCY")}</p>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      {[72, 56, 88].map((width, i) => (
        <div key={i} className="h-2 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-sky-600 to-cyan-500"
            style={{ width: `${width}%`, transition: "width 1.4s ease-out" }}
          />
        </div>
      ))}
    </div>
  </div>
);

export const LandingHeroVisual = () => (
  <div className="relative mx-auto w-full max-w-lg lg:mx-0">
    <div
      className="landing-blob landing-blob-delay-1 pointer-events-none absolute -right-4 top-8 h-32 w-32 rounded-full bg-fuchsia-400/35 blur-2xl"
      aria-hidden
    />
    <div
      className="landing-blob landing-blob-delay-2 pointer-events-none absolute -left-6 bottom-24 h-28 w-28 rounded-full bg-amber-300/40 blur-2xl"
      aria-hidden
    />
    <div className="landing-blob relative space-y-4">
      <div className="overflow-hidden rounded-2xl border-4 border-white/70 bg-white/50 shadow-2xl shadow-indigo-900/15 ring-1 ring-slate-200/80 backdrop-blur-sm">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={HERO_STILL}
            alt={t("LANDING_HERO_PREVIEW_ALT")}
            fill
            className="object-contain object-center bg-white/40 transition-transform duration-[8s] ease-in-out hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-fuchsia-500/20" />
        </div>
      </div>
      <div className="-mt-6 translate-y-2 px-1 sm:px-2">
        <DashboardPreviewMock />
      </div>
    </div>
  </div>
);
