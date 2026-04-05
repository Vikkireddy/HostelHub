import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";

const faqItems = [
  { q: t("LANDING_FAQ_Q1"), a: t("LANDING_FAQ_A1") },
  { q: t("LANDING_FAQ_Q2"), a: t("LANDING_FAQ_A2") },
  { q: t("LANDING_FAQ_Q3"), a: t("LANDING_FAQ_A3") },
  { q: t("LANDING_FAQ_Q4"), a: t("LANDING_FAQ_A4") },
  { q: t("LANDING_FAQ_Q5"), a: t("LANDING_FAQ_A5") },
];

export const LandingFaq = () => (
  <Box as="section" id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6">
    <Box className="landing-fade-up relative mx-auto" style={{ animationDelay: "0.05s" }}>
      <Box
        className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-br from-cyan-200/30 via-fuchsia-200/25 to-amber-100/40 blur-2xl"
        aria-hidden
      />
      <Box className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:p-10">
        <Typography className="text-center text-md font-semibold uppercase tracking-[0.2em] text-violet-600">
          {t("LANDING_FAQ_KICKER")}
        </Typography>
        <Typography
          as="div"
          role="heading"
          aria-level={2}
          className="mt-3 text-center text-2xl font-bold text-foreground sm:text-3xl"
        >
          {t("LANDING_FAQ_HEADING_BEFORE")}{" "}
          <Typography
            as="span"
            className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent"
          >
            {t("LANDING_FAQ_HEADING_ACCENT")}
          </Typography>
        </Typography>
        <Typography
          variant="muted"
          className="mx-auto mt-3 max-w-lg text-center leading-relaxed"
        >
          {t("LANDING_FAQ_INTRO_BEFORE_LINK")}{" "}
          <Link href="/contact" className="font-semibold text-link underline-offset-4 hover:underline">
            {t("LANDING_FAQ_CONTACT_LINK")}
          </Link>{" "}
          {t("LANDING_FAQ_INTRO_AFTER_LINK")}
        </Typography>
        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-slate-200/90">
              <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent>
                <Typography variant="muted" className="leading-relaxed">
                  {item.a}
                </Typography>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Box>
  </Box>
);
