"use client";

import { Box } from "@mui/material";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

type ResidentDetailsDrawerFooterProps = { onClose: () => void };

export const ResidentDetailsDrawerFooter = ({ onClose }: ResidentDetailsDrawerFooterProps) => (
  <Box
    sx={{
      flexShrink: 0,
      p: 2,
      borderTop: "1px solid rgb(226 232 240)",
      display: "flex",
      justifyContent: "flex-end",
    }}
  >
    <Button type="button" variant="outline" onClick={onClose}>
      {t("RESIDENT_DETAILS_CLOSE")}
    </Button>
  </Box>
);
