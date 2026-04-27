"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { cn } from "@/lib/utils";
import { SITE_CONTACT } from "@/lib/site-contact";

const LOGO_SRC = "/img/logo-transparent.png";

const textareaClass =
  "flex min-h-[132px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [channelPickerOpen, setChannelPickerOpen] = useState(false);

  const inquiryInbox =
    (typeof process.env.NEXT_PUBLIC_CONTACT_EMAIL === "string"
      ? process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim()
      : "") || SITE_CONTACT.inquiryEmail.trim();

  const buildBody = () => {
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      "",
      message,
    ].filter(Boolean) as string[];
    return lines.join("\n");
  };

  const openEmail = () => {
    if (!inquiryInbox) return;
    const body = buildBody();
    const subject = encodeURIComponent(`Admin HostelHub contact from ${name || "visitor"}`);
    window.location.href = `mailto:${inquiryInbox}?subject=${subject}&body=${encodeURIComponent(body)}`;
    setChannelPickerOpen(false);
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    const body = buildBody();
    const waText = encodeURIComponent(`Hello Admin HostelHub,\n\n${body}`);
    window.open(
      `https://wa.me/${SITE_CONTACT.whatsappE164}?text=${waText}`,
      "_blank",
      "noopener,noreferrer"
    );
    setChannelPickerOpen(false);
    setSubmitted(true);
  };

  const handlePrimaryClick = () => {
    const form = formRef.current;
    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }
    setChannelPickerOpen(true);
  };

  return (
    <Box className="relative min-h-screen overflow-x-clip bg-slate-50">
      <div className="landing-bg-mesh pointer-events-none fixed inset-0 -z-10 opacity-40" aria-hidden />

      <Box className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <Box className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/"
            className="flex items-center gap-0 transition-opacity hover:opacity-90"
          >
            <Image
              src={LOGO_SRC}
              alt="Admin Hostel Hub"
              width={320}
              height={120}
              className="h-11 w-auto max-h-11 object-contain object-left sm:h-12 sm:max-h-12"
            />
            <Typography as="span" className="text-lg font-bold text-slate-900 sm:text-xl">
              Admin HostelHub
            </Typography>
          </Link>
        </Box>

        <Box className="mx-auto max-w-2xl text-center sm:max-w-none lg:mx-0 lg:text-left">
          <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            Contact
          </Typography>
          <Typography
            as="div"
            role="heading"
            aria-level={1}
            className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            We&apos;re here to help
          </Typography>
          <Typography variant="muted" className="mx-auto mt-3 max-w-xl text-base lg:mx-0">
            Questions about plans, onboarding, or your hostel setup? Send a message or reach us on phone or WhatsApp.
          </Typography>
        </Box>

        <Box className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <Box className="space-y-6">
            <Box className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm sm:p-8">
              <Typography className="text-sm font-semibold text-slate-900">Visit</Typography>
              <Box className="mt-4 flex gap-4">
                <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                  <MapPin className="h-5 w-5" aria-hidden />
                </Box>
                <Box>
                  {SITE_CONTACT.addressLines.map((line) => (
                    <Typography key={line} className="text-sm text-slate-700">
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm sm:p-8">
              <Typography className="text-sm font-semibold text-slate-900">Email</Typography>
              <Box className="mt-4 flex gap-4">
                <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                  <Mail className="h-5 w-5" aria-hidden />
                </Box>
                <Box>
                  <a
                    href={`mailto:${SITE_CONTACT.inquiryEmail}`}
                    className="text-sm font-medium text-link underline-offset-4 hover:underline"
                  >
                    {SITE_CONTACT.inquiryEmail}
                  </a>
                  <Typography variant="muted" className="mt-1 text-xs">
                    We typically reply within a business day (IST)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm sm:p-8">
              <Typography className="text-sm font-semibold text-slate-900">Call</Typography>
              <Box className="mt-4 flex gap-4">
                <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700">
                  <Phone className="h-5 w-5" aria-hidden />
                </Box>
                <Box>
                  <a
                    href={`tel:${SITE_CONTACT.phoneTel}`}
                    className="text-sm font-medium text-link underline-offset-4 hover:underline"
                  >
                    {SITE_CONTACT.phoneDisplay}
                  </a>
                  <Typography variant="muted" className="mt-1 text-xs">
                    Weekdays, reasonable hours (IST)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm sm:p-8">
              <Typography className="text-sm font-semibold text-slate-900">WhatsApp</Typography>
              <Box className="mt-4 flex gap-4">
                <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </Box>
                <Box>
                  <a
                    href={`https://wa.me/${SITE_CONTACT.whatsappE164}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-link underline-offset-4 hover:underline"
                  >
                    {SITE_CONTACT.whatsappDisplay}
                  </a>
                  <Typography variant="muted" className="mt-1 text-xs">
                    Usually fastest for quick questions
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Card className="shadow-lg shadow-slate-900/5 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-xl">Send a message</CardTitle>
              <CardDescription>
                After you tap send, choose <strong className="text-foreground/80">email</strong> (Gmail or your mail
                app) or <strong className="text-foreground/80">WhatsApp</strong>—we&apos;ll prefill your note to the
                same team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Box className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <Typography className="text-sm font-medium text-emerald-900">
                    If a new tab or app didn&apos;t open, check your pop-up blocker or use the phone / WhatsApp options
                    on the left.
                  </Typography>
                  <Button type="button" variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </Box>
              ) : (
                <form ref={formRef} className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <Box className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      required
                    />
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      required
                    />
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="contact-phone">Phone (optional)</Label>
                    <Input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 …"
                      value={phone}
                      onChange={(ev) => setPhone(ev.target.value)}
                    />
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help?"
                      value={message}
                      onChange={(ev) => setMessage(ev.target.value)}
                      className={cn(textareaClass, "resize-y")}
                    />
                  </Box>
                  <Button type="button" className="w-full gap-2" onClick={handlePrimaryClick}>
                    <Send className="h-4 w-4" />
                    Send a message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </Box>

        <Typography variant="caption" className="mx-auto mt-12 block max-w-md text-center text-muted-foreground lg:text-left">
          Already use Admin HostelHub?{" "}
          <Link href="/login" className="font-semibold text-link underline-offset-4 hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link href="/signup" className="font-semibold text-link underline-offset-4 hover:underline">
            Create account
          </Link>
        </Typography>
      </Box>

      <ModalWithHeaderFooter
        open={channelPickerOpen}
        onOpenChange={setChannelPickerOpen}
        maxWidth="md"
        className="sm:max-w-md"
        isBackdropCloseEnabled
        headerTitle="How would you like to send?"
        headerDescription="Your name, email, and message will be included. Pick the channel you use most—we get both on our side."
        footerClassName="flex flex-col gap-2 sm:flex-col sm:space-x-0"
        footerComponent={
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={!inquiryInbox}
              onClick={openEmail}
            >
              <Mail className="h-4 w-4" />
              Send via email
            </Button>
            {!inquiryInbox ? (
              <Typography variant="caption" className="text-center text-amber-800">
                Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_CONTACT_EMAIL</code> or update{" "}
                <code className="rounded bg-muted px-1">inquiryEmail</code> in site config for email.
              </Typography>
            ) : null}
            <Button
              type="button"
              className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={openWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </>
        }
      />
    </Box>
  );
}
