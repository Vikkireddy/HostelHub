import { Box, Typography } from "@mui/material";
import { t } from "@/lib/i18n";

export function PricingHero() {
  const labels = [
    t("SUBSCRIPTION_HERO_PILL_1"),
    t("SUBSCRIPTION_HERO_PILL_2"),
    t("SUBSCRIPTION_HERO_PILL_3"),
  ];

  return (
    <Box
      component="section"
      className="bg-slate-950 px-6 pb-28 pt-10 text-center sm:px-10 sm:pt-14"
    >
      <Typography className="mx-auto inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
        {t("SUBSCRIPTION_HERO_BADGE")}
      </Typography>
      <Box className="mx-auto mt-6 flex max-w-3xl flex-col items-center">
        <Typography component="h1" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("SUBSCRIPTION_HERO_TITLE")}
        </Typography>
        <Typography className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {t("SUBSCRIPTION_HERO_SUBTITLE")}
        </Typography>
      </Box>
      <Box className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {labels.map((label) => (
          <Typography
            key={label}
            component="span"
            className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
          >
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
