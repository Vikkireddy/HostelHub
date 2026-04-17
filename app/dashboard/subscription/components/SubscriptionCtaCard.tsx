import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface SubscriptionCtaCardProps {
  paidActive: boolean;
  trialActive: boolean;
  startingTrial: boolean;
  onStartTrial: () => void;
  onComparePlans: () => void;
}

export function SubscriptionCtaCard({
  paidActive,
  trialActive,
  startingTrial,
  onStartTrial,
  onComparePlans,
}: SubscriptionCtaCardProps) {
  return (
    <Card className="mx-auto mb-8 mt-8 max-w-6xl border-0 bg-slate-950 text-white shadow-lg">
      <CardContent className="px-6 py-10 sm:px-10">
        {paidActive ? (
          <Box className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
                {t("SUBSCRIPTION_CTA_PAID_BADGE")}
              </Typography>
              <Typography component="h3" className="mt-2 text-2xl font-bold">
                {t("SUBSCRIPTION_CTA_PAID_TITLE")}
              </Typography>
              <Typography className="mt-2 max-w-xl text-sm text-slate-300">
                {t("SUBSCRIPTION_CTA_PAID_SUBTITLE")}
              </Typography>
            </Box>
            <Box className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={onComparePlans}
              >
                {t("SUBSCRIPTION_CTA_COMPARE")}
              </Button>
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">{t("SUBSCRIPTION_CTA_CONTACT")}</Link>
              </Button>
            </Box>
          </Box>
        ) : trialActive ? (
          <Box className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
                {t("SUBSCRIPTION_CTA_TRIAL_BADGE")}
              </Typography>
              <Typography component="h3" className="mt-2 text-2xl font-bold">
                {t("SUBSCRIPTION_CTA_TRIAL_TITLE")}
              </Typography>
              <Typography className="mt-2 max-w-xl text-sm text-slate-300">
                {t("SUBSCRIPTION_CTA_TRIAL_SUBTITLE")}
              </Typography>
            </Box>
            <Box className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={onComparePlans}
              >
                {t("SUBSCRIPTION_CTA_CHOOSE_PLAN")}
              </Button>
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">{t("SUBSCRIPTION_CTA_CONTACT")}</Link>
              </Button>
            </Box>
          </Box>
        ) : (
          <Box className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
                {t("SUBSCRIPTION_CTA_NEW_BADGE")}
              </Typography>
              <Typography component="h3" className="mt-2 text-2xl font-bold">
                {t("SUBSCRIPTION_CTA_NEW_TITLE")}
              </Typography>
              <Typography className="mt-2 max-w-xl text-sm text-slate-300">
                {t("SUBSCRIPTION_CTA_NEW_SUBTITLE")}
              </Typography>
            </Box>
            <Box className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100"
                onClick={onStartTrial}
                disabled={startingTrial}
                loading={startingTrial}
              >
                {t("SUBSCRIPTION_CTA_START_TRIAL")}
              </Button>
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">{t("SUBSCRIPTION_CTA_CONTACT")}</Link>
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
