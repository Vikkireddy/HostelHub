import Link from "next/link";
import { ArrowRight, Building2, LayoutDashboard, UserPlus } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";

const steps = [
  {
    step: t("LANDING_HOW_STEP_01"),
    title: t("LANDING_HOW_STEP_01_TITLE"),
    body: t("LANDING_HOW_STEP_01_BODY"),
    icon: UserPlus,
  },
  {
    step: t("LANDING_HOW_STEP_02"),
    title: t("LANDING_HOW_STEP_02_TITLE"),
    body: t("LANDING_HOW_STEP_02_BODY"),
    icon: Building2,
  },
  {
    step: t("LANDING_HOW_STEP_03"),
    title: t("LANDING_HOW_STEP_03_TITLE"),
    body: t("LANDING_HOW_STEP_03_BODY"),
    icon: LayoutDashboard,
  },
];

export const LandingHowItWorks = () => (
  <Box
    as="section"
    id="how-it-works"
    className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6"
    aria-labelledby="how-it-works-heading"
  >
    <Box className="landing-fade-up mb-10 text-center" style={{ animationDelay: "0.05s" }}>
      <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        {t("LANDING_HOW_KICKER")}
      </Typography>
      <Typography
        id="how-it-works-heading"
        as="div"
        role="heading"
        aria-level={2}
        className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
      >
        {t("LANDING_HOW_HEADING_BEFORE")}{" "}
        <Typography
          as="span"
          className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent"
        >
          {t("LANDING_HOW_HEADING_ACCENT")}
        </Typography>
      </Typography>
      <Typography variant="muted" className="mx-auto mt-4 max-w-2xl">
        {t("LANDING_HOW_SUBTITLE")}
      </Typography>
    </Box>
    <Box className="grid gap-6 md:grid-cols-3">
      {steps.map(({ step, title, body, icon: Icon }, i) => (
        <Box
          key={step}
          className="landing-fade-up relative flex flex-col rounded-2xl border border-white/65 bg-white/60 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-md"
          style={{ animationDelay: `${0.08 + i * 0.07}s` }}
        >
          <Typography className="text-xs font-bold tabular-nums text-violet-600/90">{step}</Typography>
          <Box className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 text-violet-700 ring-1 ring-violet-400/25">
            <Icon className="h-5 w-5" aria-hidden />
          </Box>
          <Typography className="mt-4 text-lg font-semibold text-card-foreground">{title}</Typography>
          <Typography variant="muted" className="mt-2 flex-1 text-sm leading-relaxed">
            {body}
          </Typography>
        </Box>
      ))}
    </Box>
    <Box className="mt-10 flex justify-center">
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
      >
        {t("LANDING_HOW_CTA_TRIAL")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Box>
  </Box>
);
