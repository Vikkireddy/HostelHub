"use client";

import { Apartment } from "@mui/icons-material";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { t } from "@/lib/i18n";

type SelectHostelPromptProps = {
  moduleLabel?: string;
};

export function SelectHostelPrompt({ moduleLabel }: SelectHostelPromptProps) {
  return (
    <Box className="flex items-center justify-center p-10">
      <Box className="w-full max-w-xl rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <Apartment sx={{ fontSize: 44, color: "action.disabled", mb: 1 }} />
        <Typography className="text-lg font-semibold">
          {t("MULTI_HOSTEL_SELECT_HOSTEL_TITLE")}
        </Typography>
        <Typography variant="muted" className="mt-2">
          {moduleLabel
            ? t("MULTI_HOSTEL_SELECT_HOSTEL_MESSAGE_WITH_MODULE").replace("{module}", moduleLabel)
            : t("MULTI_HOSTEL_SELECT_HOSTEL_MESSAGE")}
        </Typography>
      </Box>
    </Box>
  );
}
