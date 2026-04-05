"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/AuthStore";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

const LOGIN_LOGO_SRC = "/img/logo-transparent.png";

function LoginForm() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const signedUp = searchParams.get("signedup") === "1";
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(emailOrPhone, password);
    if (result.success) {
      router.push(safeNext ?? "/dashboard");
    } else {
      setError(result.message || "Invalid email/phone or password. Please try again.");
    }
  };

  return (
    <Box className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Box className="mb-8 flex flex-col items-center">
        <Link href="/" className="mb-4 flex flex-col items-center transition-opacity hover:opacity-90">
          <Box className="relative h-24 w-full max-w-[220px] sm:h-24 sm:max-w-[260px]">
            <Image
              src={LOGIN_LOGO_SRC}
              alt="Admin Hostel Hub"
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 220px, 260px"
              priority
            />
          </Box>
          <Typography as="span" className="text-2xl font-bold text-slate-900">
            Admin HostelHub
          </Typography>
        </Link>
        <Typography className="text-slate-500">Sign in with your email or phone</Typography>
      </Box>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {signedUp && (
            <Typography
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900"
              variant="caption"
            >
              Account created successfully. Sign in with your new credentials.
            </Typography>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Typography variant="error" className="p-2">{error}</Typography>
            )}
            <Box className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Box className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Email or phone number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className={cn("pl-10", "border-primary ring-2 ring-primary/20")}
                  required
                />
              </Box>
            </Box>
            <Box className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Box className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Box>
            </Box>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <Typography variant="caption" className="mt-4 block text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={safeNext ? `/signup?next=${encodeURIComponent(safeNext)}` : "/signup"}
              className="font-semibold text-[var(--link)] underline hover:opacity-90"
            >
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex min-h-screen items-center justify-center bg-slate-50">
          <Typography className="text-slate-500">Loading...</Typography>
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
