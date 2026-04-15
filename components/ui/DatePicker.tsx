"use client";

import * as React from "react";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from "@/components/ui/box";
import { formatDateOnlyLocal, parseYmdToLocalDate } from "@/lib/dateOnly";

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}
export function DatePicker({
  value,
  onChange,
  label,
  id,
  required,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  const dateValue = value
    ? parseYmdToLocalDate(value) ?? (Number.isNaN(new Date(value).getTime()) ? null : new Date(value))
    : null;
  const minDateObj = minDate ? parseYmdToLocalDate(minDate) ?? undefined : undefined;
  const maxDateObj = maxDate ? parseYmdToLocalDate(maxDate) ?? undefined : undefined;

  return (
    <Box className="space-y-2">
      {label}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          value={dateValue}
          onChange={(date) => onChange(date ? formatDateOnlyLocal(date) : "")}
          disabled={disabled}
          minDate={minDateObj}
          maxDate={maxDateObj}
          slotProps={{
            textField: {
              id,
              required,
              size: "small",
              fullWidth: true,
            },
            popper: {
              disablePortal: true,
              sx: { zIndex: 9999 },
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
