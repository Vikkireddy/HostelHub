import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, IndianRupee, LayoutDashboard, Users } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingAuthActions } from "@/components/landing/LandingAuthActions";
import { SITE_ORIGIN } from "@/lib/site-contact";

const path = "/hostel-management-software-india";

export const metadata: Metadata = {
  title: "Hostel Management Software India | Admin Hostel Hub",
  description:
    "Best hostel management software in India. Manage students, rent, payments, expenses, and room vacancy easily with Admin Hostel Hub.",
  keywords: [
    "hostel management software india",
    "pg management app india",
    "hostel rent tracking app",
    "hostel admin dashboard",
  ],
  alternates: {
    canonical: `${SITE_ORIGIN}${path}`,
  },
  openGraph: {
    title: "Hostel Management Software India | Admin Hostel Hub",
    description:
      "Best hostel management software in India. Manage students, rent, payments, expenses, and room vacancy easily with Admin Hostel Hub.",
    url: `${SITE_ORIGIN}${path}`,
    siteName: "Admin Hostel Hub",
    locale: "en_IN",
    type: "website",
  },
};

const sections = [
  {
    icon: Users,
    title: "PG management app India",
    body:
      "Whether you run a PG or a student hostel, Admin Hostel Hub helps you onboard residents, track documents, and keep occupancy clear—without spreadsheets.",
  },
  {
    icon: IndianRupee,
    title: "Hostel rent tracking app",
    body:
      "Record monthly rent, partial payments, and overdue dues in one place. Your team always sees who paid, who is pending, and what is due next.",
  },
  {
    icon: LayoutDashboard,
    title: "Hostel admin dashboard",
    body:
      "See revenue, room mix, and operational signals at a glance. Upgrade tiers unlock deeper analytics and expense insights when you are ready to scale.",
  },
  {
    icon: BedDouble,
    title: "Room vacancy and allocation",
    body:
      "Plan beds, maintenance, and move-outs with confidence so you fill rooms faster and reduce manual follow-ups.",
  },
] as const;

export default function HostelManagementSoftwareIndiaPage() {
  return (
    <Box className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-foreground">
      <LandingHeader />

      <Box as="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Typography
          as="p"
          className="text-center text-xs font-semibold uppercase tracking-wider text-primary"
        >
          India · Student housing operations
        </Typography>
        <Typography
          as="div"
          role="heading"
          aria-level={1}
          className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Hostel management software in India
        </Typography>
        <Typography variant="muted" className="mx-auto mt-5 text-center text-base leading-relaxed">
          Admin Hostel Hub is built for Indian hostel and PG operators who need reliable{" "}
          <strong className="font-semibold text-foreground">hostel management software India</strong>{" "}
          teams can adopt quickly. From daily rent collection to vacancy planning, you get a single{" "}
          <strong className="font-semibold text-foreground">hostel admin dashboard</strong> instead
          of scattered notes and WhatsApp threads.
        </Typography>

        <Box className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LandingAuthActions variant="hero-primary" />
          <LandingAuthActions variant="hero-secondary" />
        </Box>

        <Box as="section" className="mt-16 space-y-10 border-t border-border pt-14">
          {sections.map(({ icon: Icon, title, body }) => (
            <Box key={title}>
              <Box className="flex items-start gap-4">
                <Box className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </Box>
                <Box>
                  <Typography
                    as="div"
                    role="heading"
                    aria-level={2}
                    className="text-xl font-semibold text-foreground"
                  >
                    {title}
                  </Typography>
                  <Typography variant="muted" className="mt-2 text-sm leading-relaxed">
                    {body}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className="mt-16 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Typography className="text-lg font-semibold">
            Why a dedicated page for hostel management software India?
          </Typography>
          <Typography variant="muted" className="mt-3 text-sm leading-relaxed">
            Searchers often look for{" "}
            <strong className="font-semibold text-foreground">pg management app India</strong> or a{" "}
            <strong className="font-semibold text-foreground">hostel rent tracking app</strong>{" "}
            before they know the product name. This page explains how Admin Hostel Hub covers those
            jobs in one product—and links you to the full product site when you are ready.
          </Typography>
          <Box className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Back to home
            </Link>
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Create account
            </Link>
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              Contact sales
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
