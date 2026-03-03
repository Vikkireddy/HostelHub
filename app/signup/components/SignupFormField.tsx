"use client";

import * as React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { INPUT_STYLE, INPUT_LABEL_PROPS, ICON_STYLE } from "../signup.constants";

export interface SignupFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  error?: string;
  icon?: React.ReactNode;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  sx?: object;
  required?: boolean;
}

export function SignupFormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  error,
  icon,
  showPassword,
  onTogglePassword,
  sx,
  required = false,
}: SignupFormFieldProps<T>) {
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          type={inputType}
          fullWidth
          size="small"
          variant="outlined"
          required={required}
          error={!!error}
          helperText={error}
          placeholder={placeholder}
          sx={{ ...INPUT_STYLE, ...sx }}
          InputLabelProps={INPUT_LABEL_PROPS}
          InputProps={{
            ...(icon && {
              startAdornment: (
                <InputAdornment position="start">
                  {React.isValidElement(icon)
                    ? React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { sx: ICON_STYLE })
                    : icon}
                </InputAdornment>
              ),
            }),
            ...(isPassword &&
              onTogglePassword && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onTogglePassword}
                      edge="end"
                      size="small"
                      aria-label={`toggle ${name} visibility`}
                    >
                      {showPassword ? (
                        <VisibilityOff sx={ICON_STYLE} />
                      ) : (
                        <Visibility sx={ICON_STYLE} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }),
          }}
        />
      )}
    />
  );
}
