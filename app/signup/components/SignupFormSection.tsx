"use client";

import { Box, Typography } from "@mui/material";
import { SECTION_ICON_STYLE } from "../signup.constants";

interface SignupFormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function SignupFormSection({
  icon,
  title,
  children,
  columns = 2,
}: SignupFormSectionProps) {
  const gridCols =
    columns === 3
      ? { xs: "1fr", sm: "1fr 1fr 1fr" }
      : { xs: "1fr", sm: "1fr 1fr" };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          "& .MuiSvgIcon-root": SECTION_ICON_STYLE,
        }}
      >
        {icon}
        <Typography
          variant="overline"
          sx={{ color: "rgba(191, 219, 254, 0.95)", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: gridCols, gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
