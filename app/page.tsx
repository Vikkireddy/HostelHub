"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(emailOrPhone, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid email/phone or password. Please try again.");
    }
  };

  return (
    <Box className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Box className="mb-8 flex flex-col items-center">
        <Box className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary shadow-lg">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </Box>
        <h1 className="text-2xl font-bold text-slate-900">HostelHub</h1>
        <Typography className="text-slate-500">Sign in with your email or phone</Typography>
      </Box>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
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
                  placeholder="admin@hostel.com or 9876543210"
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
            <Link href="/signup" className="font-semibold text-[var(--link)] underline hover:opacity-90">
              Sign Up
            </Link>
          </Typography>
          <Typography variant="caption" className="mt-1 block text-center text-muted-foreground">
            Admin: admin@hostel.com / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
