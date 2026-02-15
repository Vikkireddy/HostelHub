"use client";

import { Box, Typography } from "@mui/material";
import { t } from "@/lib/i18n";

export function SignupFormHeader() {
  return (
    <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        sx={{
          mb: 2,
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1.5,
          bgcolor: "#18222e",
          boxShadow: 2,
        }}
      >
        <svg
          style={{ width: 36, height: 36, color: "white" }}
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
      <Typography variant="h4" fontWeight="bold" color="#0f172a">
        {t("SIGNUP_CREATE_YOUR_HOSTEL")}
      </Typography>
      <Typography variant="body2" color="#64748b">
        {t("SIGNUP_REGISTER_SUBTITLE")}
      </Typography>
    </Box>
  );
}
