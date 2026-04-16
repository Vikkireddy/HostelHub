import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingAuthActions } from "@/components/landing/LandingAuthActions";
import { SITE_ORIGIN } from "@/lib/site-contact";

const path = "/hostel-management-software-india";

export const metadata: Metadata = {
  title: "Best Hostel Management Software in India | Admin Hostel Hub",
  description:
    "Best hostel management software in India for PG & hostel owners. Track rent, students, expenses, and room vacancy. Free trial — no credit card required.",
  keywords: [
    "hostel management software india",
    "pg management app india",
    "hostel rent tracking app",
    "hostel admin dashboard",
    "student hostel management",
    "Admin Hostel Hub",
  ],
  alternates: {
    canonical: `${SITE_ORIGIN}${path}`,
  },
  openGraph: {
    title: "Best Hostel Management Software in India | Admin Hostel Hub",
    description:
      "Best hostel management software in India for PG & hostel owners. Track rent, students, expenses, and room vacancy.",
    url: `${SITE_ORIGIN}${path}`,
    siteName: "Admin Hostel Hub",
    locale: "en_IN",
    type: "website",
  },
};

const whyBullets = [
  "Track rent payments and dues in real-time",
  "Manage student data in one place",
  "Monitor income and expenses easily",
  "Get insights into room occupancy and vacancies",
  "Reduce manual errors and save time",
];

const featureBlocks = [
  {
    title: "Rent tracking system",
    body: "Track monthly rent, partial payments, and pending dues easily.",
  },
  {
    title: "Student management",
    body: "Store and manage student details, ID proofs, and contact information.",
  },
  {
    title: "Expense tracking",
    body: "Monitor hostel expenses like rent, electricity, and maintenance.",
  },
  {
    title: "Vacancy management",
    body: "Know in advance when a room will be available with vacate date tracking.",
  },
  {
    title: "CSV import",
    body: "Upload bulk student data instantly using CSV files.",
  },
  {
    title: "Dashboard analytics",
    body: "View income vs expenses and performance insights in one dashboard.",
  },
];

const benefitBullets = [
  "Affordable pricing for small businesses",
  "Easy to use without technical knowledge",
  "Works for single or multiple hostels",
  "Helps increase efficiency and reduce workload",
  "Provides better control over finances and operations",
];

const whoBullets = [
  "PG owners managing multiple tenants",
  "Student hostel administrators",
  "Small and medium hostel businesses",
  "Property managers handling rental accommodations",
];

const faqs = [
  {
    q: "What is hostel management software?",
    a: "It is a digital tool that helps hostel owners manage students, rent, expenses, and room occupancy efficiently.",
  },
  {
    q: "Is Admin Hostel Hub suitable for small hostels?",
    a: "Yes, it is designed specifically for small and medium hostel owners in India.",
  },
  {
    q: "Can I track rent and expenses?",
    a: "Yes, you can track rent payments, pending dues, and expenses in one dashboard.",
  },
  {
    q: "Is there a free trial available?",
    a: "Yes, Admin Hostel Hub offers a free trial with no credit card required.",
  },
] as const;

const blogTopicIdeas = [
  "Best Hostel Management Software in India (2026 Guide)",
  "How to Manage Hostel Rent Collection Easily",
  "Top 5 Problems Hostel Owners Face (And Solutions)",
  "Excel vs Hostel Management Software – Which is Better?",
  "How to Track PG Rent and Expenses Efficiently",
  "Complete Guide to Managing a Student Hostel",
  "Benefits of Digital Hostel Management Systems",
  "How to Reduce Rent Collection Issues in Hostels",
  "PG Management Tips for New Owners in India",
  "How to Increase Occupancy in Your Hostel",
] as const;

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Typography
      id={id}
      as="div"
      role="heading"
      aria-level={2}
      className="mt-14 scroll-mt-24 text-2xl font-bold tracking-tight text-foreground"
    >
      {children}
    </Typography>
  );
}

export default function HostelManagementSoftwareIndiaPage() {
  return (
    <Box className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-foreground">
      <LandingHeader />

      <Box as="article" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Typography
          as="p"
          className="text-center text-xs font-semibold uppercase tracking-wider text-primary"
        >
          India · PG &amp; student hostel operations
        </Typography>

        <Typography
          as="div"
          role="heading"
          aria-level={1}
          className="mt-4 text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        >
          Best Hostel Management Software in India for PG &amp; Hostel Owners
        </Typography>

        <Typography variant="muted" className="mx-auto mt-6 text-center text-base leading-relaxed">
          Admin Hostel Hub is a powerful and easy-to-use{" "}
          <strong className="font-semibold text-foreground">hostel management software in India</strong>{" "}
          designed for PG owners and student housing operators. It helps you manage rent collection,
          student records, expenses, and room availability in one smart{" "}
          <strong className="font-semibold text-foreground">hostel admin dashboard</strong>. Whether
          you run a small hostel or multiple PG properties, Admin Hostel Hub simplifies daily
          operations and eliminates manual work.
        </Typography>

        <Box className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LandingAuthActions variant="hero-primary" />
          <LandingAuthActions variant="hero-secondary" />
        </Box>

        <Box as="section" aria-labelledby="why-heading">
          <SectionHeading id="why-heading">Why Choose Admin Hostel Hub</SectionHeading>
          <Typography variant="muted" className="mt-4 text-sm leading-relaxed sm:text-base">
            Managing a hostel manually using notebooks or Excel can be time-consuming and
            error-prone. Admin Hostel Hub provides a digital solution to streamline all your
            operations.
          </Typography>
          <Typography className="mt-4 text-sm font-semibold text-foreground">
            With our hostel management system, you can:
          </Typography>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {whyBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Box>

        <Box as="section" aria-labelledby="features-heading">
          <SectionHeading id="features-heading">Key Features of Hostel Management Software</SectionHeading>
          <Typography variant="muted" className="mt-4 text-sm leading-relaxed sm:text-base">
            Admin Hostel Hub offers everything a hostel owner needs:
          </Typography>
          <ul className="mt-6 space-y-5">
            {featureBlocks.map(({ title, body }) => (
              <li key={title} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <Box>
                  <Typography className="font-semibold text-foreground">{title}</Typography>
                  <Typography variant="muted" className="mt-1 text-sm leading-relaxed">
                    {body}
                  </Typography>
                </Box>
              </li>
            ))}
          </ul>
        </Box>

        <Box as="section" aria-labelledby="benefits-heading">
          <SectionHeading id="benefits-heading">Benefits for PG Owners in India</SectionHeading>
          <Typography variant="muted" className="mt-4 text-sm leading-relaxed sm:text-base">
            Admin Hostel Hub is specially designed for Indian PG and hostel owners.
          </Typography>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {benefitBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Box>

        <Box as="section" aria-labelledby="who-heading">
          <SectionHeading id="who-heading">Who Can Use This Software?</SectionHeading>
          <Typography variant="muted" className="mt-4 text-sm leading-relaxed sm:text-base">
            This hostel management software is ideal for:
          </Typography>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {whoBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Box>

        <Box as="section" aria-labelledby="start-heading">
          <SectionHeading id="start-heading">Get Started Today</SectionHeading>
          <Typography variant="muted" className="mt-4 text-sm leading-relaxed sm:text-base">
            Start managing your hostel the smart way with Admin Hostel Hub. Sign up today and
            experience a simple, fast, and efficient hostel management system.
          </Typography>
          <ul className="mt-4 list-none space-y-2 text-sm font-medium text-foreground sm:text-base">
            <li>Free trial available</li>
            <li>No credit card required</li>
          </ul>
          <Box className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
            <LandingAuthActions variant="hero-primary" />
            <LandingAuthActions variant="hero-secondary" />
          </Box>
        </Box>

        <Box
          as="section"
          className="mt-16 rounded-2xl border border-border bg-card p-6 shadow-sm"
          aria-labelledby="faq-heading"
        >
          <Typography
            id="faq-heading"
            as="div"
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-foreground"
          >
            Frequently asked questions
          </Typography>
          <Box className="mt-8 space-y-8">
            {faqs.map(({ q, a }) => (
              <Box key={q}>
                <Typography className="font-semibold text-foreground">{q}</Typography>
                <Typography variant="muted" className="mt-2 text-sm leading-relaxed sm:text-base">
                  {a}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box as="section" className="mt-14 border-t border-border pt-12" aria-labelledby="blog-ideas-heading">
          <Typography
            id="blog-ideas-heading"
            as="div"
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-foreground"
          >
            More guides for hostel owners (content roadmap)
          </Typography>
          <Typography variant="muted" className="mt-3 text-sm leading-relaxed">
            Publishing helpful articles on topics like{" "}
            <strong className="font-semibold text-foreground">pg management app India</strong> and{" "}
            <strong className="font-semibold text-foreground">hostel rent tracking app</strong> builds
            trust with Google and with operators. Here are strong article ideas to add next:
          </Typography>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {blogTopicIdeas.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ol>
        </Box>

        <Box className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            Home
          </Link>
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
          <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
            Contact
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
