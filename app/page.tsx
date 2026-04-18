import Link from "next/link";
import { SITE_CONTACT } from "@/lib/site-contact";
import {
  BarChart3,
  BedDouble,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingAuthActions } from "@/components/landing/LandingAuthActions";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { LandingTrustStrip } from "@/components/landing/LandingTrustStrip";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingAbout } from "@/components/landing/LandingAbout";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { FooterSocialLinks } from "@/components/landing/FooterSocialLinks";

const features = [
  {
    title: "Multi-hostel management",
    description:
      "Manage unlimited properties from one dashboard. Switch between hostels instantly.",
    icon: Building2,
  },
  {
    title: "Smart room allocation",
    description: "Visual room plans, bed-level occupancy, and drag-and-drop moves when you need them.",
    icon: BedDouble,
  },
  {
    title: "Digital resident records",
    description: "Profiles, documents, emergency contacts, and payment history in one secure place.",
    icon: Users,
  },
  {
    title: "Automated invoicing",
    description: "Recurring fee schedules, reminders, and clear records for every resident.",
    icon: FileText,
  },
  {
    title: "Financial analytics",
    description: "Revenue, expenses, and profitability insights with exports for accounting.",
    icon: BarChart3,
  },
  {
    title: "Bank-grade security",
    description: "Encryption, backups, and role-aware access so your team sees only what they need.",
    icon: ShieldCheck,
  },
] as const;

const featureAccent = [
  "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-700 ring-cyan-500/20",
  "bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-700 ring-violet-500/20",
  "bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-800 ring-amber-500/25",
  "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-700 ring-emerald-500/20",
  "bg-gradient-to-br from-rose-500/20 to-rose-500/5 text-rose-700 ring-rose-500/20",
  "bg-gradient-to-br from-sky-500/20 to-sky-500/5 text-sky-700 ring-sky-500/20",
] as const;

const FOOTER_PRODUCT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
] as const;

const FOOTER_CONTACT_LINK_CLASS = "hover:text-white";

const FOOTER_CONTACT_ITEMS = [
  {
    key: "address",
    href: null,
    label: SITE_CONTACT.addressLines.join(", "),
    external: false,
  },
  {
    key: "email",
    href: `mailto:${SITE_CONTACT.inquiryEmail}`,
    label: SITE_CONTACT.inquiryEmail,
    external: false,
  },
  {
    key: "whatsapp",
    href: `https://wa.me/${SITE_CONTACT.whatsappE164}`,
    label: `WhatsApp: ${SITE_CONTACT.whatsappDisplay}`,
    external: true,
  },
] as const;

export default function LandingPage() {
  return (
    <Box className="relative min-h-screen overflow-x-clip text-foreground">
      <Box className="landing-bg-mesh fixed inset-0 -z-20" aria-hidden />
      <Box
        className="pointer-events-none fixed inset-0 -z-10 bg-[length:72px_72px] opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
          `,
        }}
        aria-hidden
      />
      <Box
        className="landing-blob pointer-events-none fixed -left-24 top-32 -z-10 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl"
        aria-hidden
      />
      <Box
        className="landing-blob landing-blob-delay-1 pointer-events-none fixed -right-20 top-1/3 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl"
        aria-hidden
      />
      <Box
        className="landing-blob landing-blob-delay-2 pointer-events-none fixed bottom-20 left-1/3 -z-10 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl"
        aria-hidden
      />

      <LandingHeader />

      <Box as="main">
        <Box
          as="section"
          className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16"
        >
          <Box className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 lg:text-left">
            <Box className="text-center lg:text-left">
              <Typography
                as="p"
                className="landing-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-white/60 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm"
                style={{ animationDelay: "0.05s" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                New: Smart room allocation
              </Typography>
              <Typography
                as="div"
                role="heading"
                aria-level={1}
                className="landing-fade-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                style={{ animationDelay: "0.12s" }}
              >
                The modern standard for{" "}
                <Typography
                  as="span"
                  className="bg-gradient-to-r from-primary via-sky-600 to-violet-600 bg-clip-text text-transparent"
                >
                  Hostel Management
                </Typography>
              </Typography>
              <Typography
                as="p"
                className="landing-fade-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0"
                style={{ animationDelay: "0.2s" }}
              >
                Admin HostelHub gives you a single, powerful command center to automate bookings,
                collect payments, and manage residents with ease.
              </Typography>
              <Box
                className="landing-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 lg:justify-start"
                style={{ animationDelay: "0.28s" }}
              >
                <LandingAuthActions variant="hero-primary" />
                <LandingAuthActions variant="hero-secondary" />
              </Box>
            </Box>
            <Box className="landing-fade-up" style={{ animationDelay: "0.18s" }}>
              <LandingHeroVisual />
            </Box>
          </Box>
        </Box>

        <LandingTrustStrip />

        <Box as="section" id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6">
          <Box className="landing-fade-up mb-4 text-center" style={{ animationDelay: "0.05s" }}>
            <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              Powerful features
            </Typography>
            <Typography
              as="div"
              role="heading"
              aria-level={2}
              className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            >
              Everything you need to{" "}
              <Typography
                as="span"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent"
              >
                run a smart hostel
              </Typography>
            </Typography>
            <Typography variant="muted" className="mx-auto mt-4 max-w-2xl">
              One platform for rooms, residents, money, and reporting—without juggling extra tools.
            </Typography>
          </Box>
          <Box className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, icon: Icon }, i) => (
              <Box
                key={title}
                className="landing-fade-up group rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-xl"
                style={{ animationDelay: `${0.08 + i * 0.06}s` }}
              >
                <Box
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${featureAccent[i % featureAccent.length]}`}
                >
                  <Icon className="h-5 w-5" />
                </Box>
                <Typography as="div" className="text-lg font-semibold text-card-foreground">
                  {title}
                </Typography>
                <Typography variant="muted" className="mt-2 text-sm leading-relaxed">
                  {description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <LandingHowItWorks />

        <LandingAbout />

        <LandingFaq />
      </Box>

      <Box
        as="footer"
        id="contact"
        className="scroll-mt-24 border-t border-border bg-primary text-primary-foreground"
      >
        <Box className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Box className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <Box>
              <Typography className="text-lg font-bold text-white">
                Admin Hostel<Typography as="span" className="text-slate-300">
                  Hub
                </Typography>
              </Typography>
              <Typography className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                Modern resident housing operations—simple, efficient, and secure.
              </Typography>
            </Box>
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                Product
              </Typography>
              <Box asChild>
                <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
                  {FOOTER_PRODUCT_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                Company
              </Typography>
              <Box asChild>
                <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
                  <li>
                    <Typography as="span" className="text-primary-foreground/45">
                      Privacy &amp; terms
                    </Typography>
                  </li>
                  <li>
                    <Link
                      href="/platform/login"
                      className="text-primary-foreground/50 transition-colors hover:text-white"
                    >
                      Platform admin
                    </Link>
                  </li>
                </ul>
              </Box>
            </Box>
            <Box>
              <Typography className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/55">
                Contact
              </Typography>
              <Box asChild>
                <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
                  {FOOTER_CONTACT_ITEMS.map(({ key, href, label, external }) => (
                    <li key={key}>
                      {href ? (
                        <Box asChild>
                          <a
                            href={href}
                            className={FOOTER_CONTACT_LINK_CLASS}
                            {...(external
                              ? { target: "_blank", rel: "noopener noreferrer" as const }
                              : {})}
                          >
                            {label}
                          </a>
                        </Box>
                      ) : (
                        label
                      )}
                    </li>
                  ))}
                </ul>
              </Box>
              <FooterSocialLinks />
            </Box>
          </Box>
          <Box className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-primary-foreground/55 sm:flex-row">
            <Typography variant="caption" className="text-primary-foreground/55">
              © {new Date().getFullYear()} Admin HostelHub. All rights reserved.
            </Typography>
            <Typography variant="caption" className="text-primary-foreground/55">
              Made with care for hostel operators.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
