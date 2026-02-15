"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Typography, Paper } from "@mui/material";
import { t } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validations/signup";
import { SignupFormHeader, SignupFormFields } from "./components";

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

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
        router.push("/?signedup=1");
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        py: 4,
        px: 2,
      }}
    >
      <SignupFormHeader />

      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 560,
          p: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#0f172a" gutterBottom>
          {t("SIGNUP_TITLE")}
        </Typography>
        <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
          {t("SIGNUP_FILL_DETAILS")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mb: 2, p: 1.5, bgcolor: "error.light", borderRadius: 1 }}
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

          <Typography variant="body2" color="#64748b" sx={{ mt: 2, textAlign: "center" }}>
            {t("SIGNUP_ALREADY_HAVE_ACCOUNT")}{" "}
            <Link href="/" style={{ color: "#227D9B", fontWeight: 600, textDecoration: "underline" }}>
              {t("SIGNUP_SIGN_IN")}
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
