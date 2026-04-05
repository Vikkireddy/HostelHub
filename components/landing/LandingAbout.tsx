import Link from "next/link";
import { ArrowRight, Heart, Target, UsersRound } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: t("LANDING_ABOUT_STAT1_VALUE"),
    label: t("LANDING_ABOUT_STAT1_LABEL"),
    sub: t("LANDING_ABOUT_STAT1_SUB"),
  },
  {
    value: t("LANDING_ABOUT_STAT2_VALUE"),
    label: t("LANDING_ABOUT_STAT2_LABEL"),
    sub: t("LANDING_ABOUT_STAT2_SUB"),
  },
  {
    value: t("LANDING_ABOUT_STAT3_VALUE"),
    label: t("LANDING_ABOUT_STAT3_LABEL"),
    sub: t("LANDING_ABOUT_STAT3_SUB"),
  },
  {
    value: t("LANDING_ABOUT_STAT4_VALUE"),
    label: t("LANDING_ABOUT_STAT4_LABEL"),
    sub: t("LANDING_ABOUT_STAT4_SUB"),
  },
];

const pillars = [
  {
    title: t("LANDING_ABOUT_PILLAR_MISSION_TITLE"),
    body: t("LANDING_ABOUT_PILLAR_MISSION_BODY"),
    icon: Target,
  },
  {
    title: t("LANDING_ABOUT_PILLAR_VISION_TITLE"),
    body: t("LANDING_ABOUT_PILLAR_VISION_BODY"),
    icon: Heart,
  },
  {
    title: t("LANDING_ABOUT_PILLAR_VALUES_TITLE"),
    body: t("LANDING_ABOUT_PILLAR_VALUES_BODY"),
    icon: UsersRound,
  },
];

export const LandingAbout = () => (
  <Box
    as="section"
    id="about"
    className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6"
  >
    <Box
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(100%,28rem)] rounded-[2.5rem] bg-gradient-to-b from-violet-200/25 via-cyan-100/20 to-transparent blur-2xl"
      aria-hidden
    />

    <Box className="landing-fade-up relative pt-4" style={{ animationDelay: "0.05s" }}>
      <Box className="mx-auto max-w-3xl text-center">
        <Typography className="inline-flex rounded-full border border-violet-300/40 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 backdrop-blur-sm">
          {t("LANDING_ABOUT_BADGE")}
        </Typography>
        <Typography
          as="div"
          role="heading"
          aria-level={2}
          className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15]"
        >
          {t("LANDING_ABOUT_HEADING_BEFORE")}{" "}
          <Typography
            as="span"
            className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            {t("LANDING_ABOUT_HEADING_ACCENT")}
          </Typography>{" "}
          {t("LANDING_ABOUT_HEADING_AFTER")}
        </Typography>
        <Typography variant="muted" className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
          {t("LANDING_ABOUT_LEAD")}
        </Typography>
      </Box>

      {/* Metrics: single glass strip, not four separate cards */}
      <Box className="mx-auto mt-14 max-w-5xl">
        <Box className="rounded-2xl border border-white/50 bg-white/45 px-4 py-8 shadow-sm shadow-slate-900/[0.04] backdrop-blur-md sm:px-8 sm:py-10">
          <ul className="grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {stats.map((s, i) => (
              <li
                key={s.label}
                className={cn(
                  "relative text-center lg:text-left",
                  i > 0 &&
                    "lg:pl-8 before:hidden lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-12 lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-gradient-to-b lg:before:from-transparent lg:before:via-slate-300/70 lg:before:to-transparent"
                )}
              >
                <Typography className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                  {s.value}
                </Typography>
                <Typography className="mt-1 text-sm font-semibold text-foreground">{s.label}</Typography>
                <Typography variant="muted" className="mt-0.5 text-xs leading-snug sm:text-[13px]">
                  {s.sub}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      </Box>

      <Box className="mx-auto mt-20 max-w-2xl text-center">
        <Typography as="div" role="heading" aria-level={3} className="text-xl font-bold text-foreground sm:text-2xl">
          {t("LANDING_ABOUT_DRIVES_TITLE")}
        </Typography>
        <Typography variant="muted" className="mx-auto mt-3 max-w-lg text-sm sm:text-base">
          {t("LANDING_ABOUT_DRIVES_SUB")}
        </Typography>
      </Box>

      {/* Editorial stack — dividers only, no card grid */}
      <ul className="mx-auto mt-12 max-w-3xl list-none space-y-0 p-0">
        {pillars.map(({ title, body, icon: Icon }, i) => (
          <li
            key={title}
            className="landing-fade-up group flex gap-5 border-t border-slate-200/70 py-10 first:border-t-0 first:pt-0 sm:gap-6 sm:py-12"
            style={{ animationDelay: `${0.08 + i * 0.06}s` }}
          >
            <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/[0.12] to-cyan-500/[0.1] text-violet-700 ring-1 ring-violet-400/20 transition duration-300 group-hover:from-violet-500/[0.18] group-hover:to-cyan-500/[0.14]">
              <Icon className="h-6 w-6" aria-hidden />
            </Box>
            <Box className="min-w-0 flex-1 pt-0.5">
              <Typography className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {title}
              </Typography>
              <Typography variant="muted" className="mt-2 text-sm leading-relaxed sm:text-[15px]">
                {body}
              </Typography>
            </Box>
          </li>
        ))}
      </ul>

      <Box className="mt-12 flex justify-center sm:mt-14">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary-500"
        >
          {t("LANDING_ABOUT_CTA_WORKSPACE")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Box>
    </Box>
  </Box>
);
