"use client";

import type { ComponentProps, FormEvent } from "react";
import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { cn } from "@/lib/utils";

const PAGE_SHELL =
  "flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10";

const INPUT_CLASS =
  "border-slate-600 bg-slate-950/80 text-slate-100 placeholder:text-slate-500";

const ICON_LEFT = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500";

function platformLoginErrorMessage(data: Record<string, unknown>): string {
  if (typeof data.error === "string") return data.error;
  if (typeof data.hint === "string") {
    return `${typeof data.error === "string" ? data.error : "Setup required"}. ${data.hint}`;
  }
  return "Sign-in failed.";
}

function InputWithLeftIcon({
  icon: Icon,
  className,
  ...inputProps
}: ComponentProps<typeof Input> & { icon: LucideIcon }) {
  return (
    <Box className="relative">
      <Icon className={ICON_LEFT} aria-hidden />
      <Input {...inputProps} className={cn(INPUT_CLASS, "pl-10", className)} />
    </Box>
  );
}

function PlatformLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const reason = useSearchParams().get("reason");

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/platform/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (res.ok && data.success === true) {
          router.push("/platform/dashboard");
          router.refresh();
          return;
        }
        setError(platformLoginErrorMessage(data));
      } catch {
        setError("Unable to reach server.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <Box className={PAGE_SHELL}>
      <Box className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Platform admin</h1>
        <Typography className="mt-1 text-sm text-slate-400">
          HostelHub — sign in to view all hostels and platform metrics
        </Typography>
      </Box>

      {reason === "config" && (
        <Typography
          variant="caption"
          className="mb-4 max-w-md rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-center text-amber-100"
        >
          Server is missing <code className="text-amber-200">PLATFORM_STATS_SECRET</code> in{" "}
          <code className="text-amber-200">.env</code>. Add it and restart, then sign in below.
        </Typography>
      )}

      <Card className="w-full max-w-md border-slate-700/80 bg-slate-900/90 shadow-xl shadow-black/40">
        <CardHeader>
          <CardTitle className="text-xl text-slate-50">Super admin sign in</CardTitle>
          <CardDescription className="text-slate-400">
            Use credentials from your <code className="text-slate-300">.env</code> (
            <code className="text-slate-300">SUPER_ADMIN_EMAIL</code> /{" "}
            <code className="text-slate-300">SUPER_ADMIN_PASSWORD</code>). Session lasts 8 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Typography
                variant="error"
                className="rounded-md border border-red-500/30 bg-red-950/40 p-2 text-sm"
              >
                {error}
              </Typography>
            ) : null}
            <Box className="space-y-2">
              <Label htmlFor="platform-email" className="text-slate-200">
                Email
              </Label>
              <InputWithLeftIcon
                icon={Mail}
                id="platform-email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="platform-password" className="text-slate-200">
                Password
              </Label>
              <Box className="relative">
                <Lock className={ICON_LEFT} aria-hidden />
                <Input
                  id="platform-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(INPUT_CLASS, "pl-10 pr-10")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Box>
            </Box>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <Typography variant="caption" className="mt-4 block text-center text-slate-500">
            <Link href="/" className="text-sky-400 underline hover:text-sky-300">
              Back to site
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function PlatformLoginPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Loading…
        </Box>
      }
    >
      <PlatformLoginForm />
    </Suspense>
  );
}
