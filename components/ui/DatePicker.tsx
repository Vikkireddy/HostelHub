"use client";

import * as React from "react";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from "@/components/ui/box";

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
  const toYmdLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateValue = value ? new Date(value + "T00:00:00") : null;
  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined;
  const maxDateObj = maxDate ? new Date(maxDate + "T00:00:00") : undefined;

  return (
    <Box className="space-y-2">
      {label}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          value={dateValue}
          onChange={(date) => onChange(date ? toYmdLocal(date) : "")}
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
