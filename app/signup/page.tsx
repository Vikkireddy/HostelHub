"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { t } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validations/signup";
import { SignupFormFields } from "./components";

const DEFAULT_VALUES: SignupFormValues = {
  hostelName: "",
  ownerName: "",
  email: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const LEFT_FEATURES = [
  {
    title: "Easy Management",
    description: "Handle rooms, tenants, and operations in one place",
  },
  {
    title: "Real-time Updates",
    description: "Track bookings and availability instantly",
  },
  {
    title: "Secure & Reliable",
    description: "Your data is safe and always accessible",
  },
] as const;

function SignupPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextAfterSignup = searchParams.get("next");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = async (data: SignupFormValues) => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostelName: data.hostelName,
          ownerName: data.ownerName,
          email: data.email,
          mobile: data.mobile,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          pincode: data.pincode || undefined,
          password: data.password,
          acceptTerms: data.acceptTerms,
        }),
      });
      const result = await res.json();

      if (result.success) {
        if (
          nextAfterSignup &&
          nextAfterSignup.startsWith("/") &&
          !nextAfterSignup.startsWith("//")
        ) {
          router.push(`/login?signedup=1&next=${encodeURIComponent(nextAfterSignup)}`);
        } else {
          router.push("/login?signedup=1");
        }
      } else {
        setSubmitError(result.message || t("SIGNUP_FAILED"));
      }
    } catch {
      setSubmitError(t("SIGNUP_ERROR_OCCURRED"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.22), transparent 45%), radial-gradient(circle at 85% 25%, rgba(99,102,241,0.2), transparent 42%), linear-gradient(135deg, #0b1220 0%, #0f172a 45%, #111827 100%)",
        py: { xs: 2, md: 4 },
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          // maxWidth: 1120,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.25fr" },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 6 },
            borderRight: { xs: "none", md: "1px solid rgba(148, 163, 184, 0.12)" },
            borderBottom: { xs: "1px solid rgba(148, 163, 184, 0.12)", md: "none" },
            background: "rgba(8, 24, 58, 0.46)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "min(400px, 100%)",
              mx: "auto",
            }}
          >
            <Box
              sx={{
                mb: 3.25,
                width: "50%",
                borderRadius: 2,
                px: 2.25,
                py: 2,
                bgcolor: "rgba(248, 250, 252, 0.96)",
                border: "1px solid rgba(148, 163, 184, 0.45)",
                boxShadow: "0 10px 28px rgba(2, 6, 23, 0.18)",
              }}
            >
              <Link
                href="/"
                className="block w-full leading-none transition-opacity hover:opacity-90"
              >
                <Image
                  src="/img/AhhLogo.svg"
                  alt="Admin Hostel Hub"
                  width={1536}
                  height={1024}
                  className="h-[7rem] w-auto max-h-none max-w-full object-contain object-left sm:h-[8.5rem]"
                  priority
                />
              </Link>
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: { xs: "40px", md: "30px" },
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  mb: 2.6,
                }}
              >
                {t("SIGNUP_CREATE_YOUR_HOSTEL")}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(226,232,240,0.86)",
                  maxWidth: 330,
                  fontSize: "16px",
                  lineHeight: 1.42,
                  mb: 5,
                }}
              >
                Manage your hostel operations with ease and efficiency.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gap: 3.1 }}>
              {LEFT_FEATURES.map((feature, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1.8, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      mt: 0.4,
                      height: 24,
                      width: 24,
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "rgba(59, 130, 246, 0.22)",
                      color: "#bfdbfe",
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 15 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: "#f1f5f9",
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: 1.25,
                        mb: 0.8,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(226,232,240,0.85)",
                        fontSize: "14px",
                        lineHeight: 1.35,
                        maxWidth: 280,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 3, md: 6 },
            background: "rgba(11, 25, 56, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 620,
              mx: "auto",
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              bgcolor: "rgba(15, 23, 42, 0.58)",
              boxShadow: "0 14px 30px rgba(2, 6, 23, 0.45)",
            }}
          >
            <Typography variant="h4" fontWeight={700} color="#f8fafc" gutterBottom>
              {t("SIGNUP_TITLE")}
            </Typography>
            <Typography variant="body2" color="rgba(203, 213, 225, 0.9)" sx={{ mb: 3 }}>
              {t("SIGNUP_FILL_DETAILS")}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              {submitError && (
                <Typography
                  variant="body2"
                  color="#fecaca"
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid rgba(248, 113, 113, 0.45)",
                    bgcolor: "rgba(127, 29, 29, 0.35)",
                  }}
                >
                  {submitError}
                </Typography>
              )}

              <SignupFormFields
                control={control}
                errors={errors}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onTogglePassword={() => setShowPassword((p) => !p)}
                onToggleConfirmPassword={() => setShowConfirmPassword((p) => !p)}
                isSubmitting={isSubmitting}
              />

              <Typography variant="body2" color="rgba(203, 213, 225, 0.85)" sx={{ mt: 2.5, textAlign: "center" }}>
                {t("SIGNUP_ALREADY_HAVE_ACCOUNT")}{" "}
                <Link
                  href={
                    nextAfterSignup &&
                    nextAfterSignup.startsWith("/") &&
                    !nextAfterSignup.startsWith("//")
                      ? `/login?next=${encodeURIComponent(nextAfterSignup)}`
                      : "/login"
                  }
                  style={{ color: "#60a5fa", fontWeight: 600 }}
                >
                  {t("SIGNUP_SIGN_IN")}
                </Link>
              </Typography>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        >
          Loading…
        </Box>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
