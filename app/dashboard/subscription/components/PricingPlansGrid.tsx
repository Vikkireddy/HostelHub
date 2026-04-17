import { Check } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/subscription/types";
import { t } from "@/lib/i18n";

function planCheckoutLabel(planId: string): string {
  if (planId === "basic") return t("SUBSCRIPTION_PLAN_BTN_BASE");
  if (planId === "pro") return t("SUBSCRIPTION_PLAN_BTN_PRO");
  return t("SUBSCRIPTION_PLAN_BTN_PRO_PLUS");
}

interface PricingPlansGridProps {
  plans: SubscriptionPlan[];
  activating: string | null;
  onCheckout: (planId: string) => void;
}

export function PricingPlansGrid({ plans, activating, onCheckout }: PricingPlansGridProps) {
  return (
    <Box id="pricing-plans" className="mx-auto max-w-6xl scroll-mt-8">
      <Box className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isPro = plan.id === "pro";
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-visible border bg-white transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-lg",
                isPro
                  ? "border-2 border-slate-900 shadow-lg md:-translate-y-1 md:scale-[1.02]"
                  : "border-slate-200 shadow-sm"
              )}
            >
              {isPro && (
                <Typography
                  component="span"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white"
                >
                  {t("SUBSCRIPTION_MOST_POPULAR")}
                </Typography>
              )}
              <CardContent className="flex h-full flex-col p-6">
                <Box className="text-left">
                  <Typography className="text-lg font-semibold text-slate-900">{plan.name}</Typography>
                  <Typography className="text-sm text-slate-500">{plan.tagline}</Typography>
                  <Typography className="mt-4 text-xl text-slate-900">
                    <Typography
                      component="span"
                      className="rounded-md bg-amber-100 px-2 py-0.5 text-[22px] font-extrabold leading-none text-amber-900"
                    >
                      ₹{plan.price_monthly.toLocaleString("en-IN")}
                    </Typography>
                    <Typography component="span" className="text-base font-normal text-slate-500">
                      {" "}
                      /month
                    </Typography>
                  </Typography>
                  <Typography className="mt-3 text-sm leading-relaxed text-slate-600">
                    {plan.description}
                  </Typography>
                </Box>
                <Box component="ul" className="mt-6 flex flex-1 flex-col gap-2.5 text-left text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <Box key={feature} component="li" className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <Typography component="span" className="text-sm text-slate-600">
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box className="mt-8">
                  <Button
                    className={cn("w-full cursor-pointer", isPro && "bg-slate-900 text-white hover:bg-slate-800")}
                    variant={isPro ? "default" : "outline"}
                    onClick={() => onCheckout(plan.id)}
                    loading={activating === plan.id}
                    disabled={!!activating}
                  >
                    {planCheckoutLabel(plan.id)}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
