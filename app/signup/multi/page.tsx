"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { t } from "@/lib/i18n";

/** Legacy URL: multi-hostel signup now lives on the main `/signup` page (radio at top). */
export default function SignupMultiRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup");
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <CircularProgress size={28} sx={{ color: "#60a5fa" }} />
      <Typography variant="body2" color="rgba(203, 213, 225, 0.9)">
        {t("SIGNUP_REDIRECT_TO_MAIN")}
      </Typography>
    </Box>
  );
}
