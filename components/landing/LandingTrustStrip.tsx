import { CalendarClock, CreditCard, FileSpreadsheet, Lock } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";

const items = [
  {
    icon: CalendarClock,
    title: t("LANDING_TRUST_TRIAL_TITLE"),
    text: t("LANDING_TRUST_TRIAL_TEXT"),
  },
  {
    icon: CreditCard,
    title: t("LANDING_TRUST_NO_CARD_TITLE"),
    text: t("LANDING_TRUST_NO_CARD_TEXT"),
  },
  {
    icon: Lock,
    title: t("LANDING_TRUST_SECURE_TITLE"),
    text: t("LANDING_TRUST_SECURE_TEXT"),
  },
  {
    icon: FileSpreadsheet,
    title: t("LANDING_TRUST_EXPORT_TITLE"),
    text: t("LANDING_TRUST_EXPORT_TEXT"),
  },
];

export const LandingTrustStrip = () => (
  <Box
    as="section"
    className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
    aria-label={t("LANDING_TRUST_ARIA")}
  >
    <Box className="landing-fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.04s" }}>
      {items.map(({ icon: Icon, title, text }) => (
        <Box
          key={title}
          className="flex gap-3 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-md shadow-slate-900/5 backdrop-blur-sm"
        >
          <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 text-cyan-700 ring-1 ring-cyan-500/20">
            <Icon className="h-5 w-5" aria-hidden />
          </Box>
          <Box className="min-w-0">
            <Typography className="text-sm font-semibold text-foreground">{title}</Typography>
            <Typography variant="muted" className="mt-1 text-xs leading-relaxed">
              {text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);
