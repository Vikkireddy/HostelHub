"use client";

import { Box, Typography } from "@mui/material";

export const ResidentDetailsInfoRow = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) => (
  <Box>
    <Typography variant="caption" sx={{ color: "rgb(100 116 139)", fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "rgb(30 41 59)",
        mt: 0.25,
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        overflow: multiline ? "visible" : "hidden",
        textOverflow: multiline ? "clip" : "ellipsis",
      }}
      title={value}
    >
      {value}
    </Typography>
  </Box>
);
