"use client";

import { Divider, Typography, Checkbox, FormControlLabel, Button } from "@mui/material";
import type { Control, FieldErrors } from "react-hook-form";
import type { SignupFormValues } from "@/lib/validations/signup";
import { SignupFormField, SignupFormSection } from "./index";
import { Controller } from "react-hook-form";
import { t } from "@/lib/i18n";
import { SIGNUP_SECTIONS } from "../SignupSectionConfig";

interface SignupFormFieldsProps {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  isSubmitting: boolean;
}

export function SignupFormFields({
  control,
  errors,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  isSubmitting,
}: SignupFormFieldsProps) {
  const getPasswordProps = (name: string) => {
    if (name === "password") {
      return { showPassword, onTogglePassword };
    }
    if (name === "confirmPassword") {
      return { showPassword: showConfirmPassword, onTogglePassword: onToggleConfirmPassword };
    }
    return {};
  };

  const getError = (name: keyof SignupFormValues) => errors[name]?.message as string | undefined;

  return (
    <>
      {SIGNUP_SECTIONS.map((section, index) => (
        <div key={section.id}>
          {index === 2 && <Divider sx={{ my: 2 }} />}
          <SignupFormSection icon={section.icon} title={t(section.titleKey)} columns={section.columns}>
            {section.fields.map((field) => (
              <SignupFormField
                key={field.name}
                name={field.name}
                control={control}
                label={t(field.labelKey)}
                placeholder={t(field.placeholderKey) || undefined}
                type={field.type}
                error={getError(field.name)}
                icon={field.icon}
                sx={field.sx}
                required={field.required}
                {...(field.type === "password" ? getPasswordProps(field.name) : {})}
              />
            ))}
          </SignupFormSection>
        </div>
      ))}

      <Typography variant="caption" color="#64748b" sx={{ display: "block", mb: 2 }}>
        {t("SIGNUP_PASSWORD_HINT")}
      </Typography>

      <Controller
        name="acceptTerms"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                sx={{
                  color: "#94a3b8",
                  "&.Mui-checked": { color: "#18222e" },
                }}
              />
            }
            label={
              <Typography variant="body2">
                {t("SIGNUP_ACCEPT_TERMS")}
              </Typography>
            }
            sx={{ mb: 3 }}
          />
        )}
      />
      {errors.acceptTerms && (
        <Typography variant="caption" color="error" sx={{ display: "block", mb: 2 }}>
          {errors.acceptTerms.message}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isSubmitting}
        sx={{
          bgcolor: "#18222e",
          "&:hover": { bgcolor: "#243a5c" },
          py: 1.5,
          borderRadius: "12px",
        }}
      >
        {isSubmitting ? t("SIGNUP_CREATING_ACCOUNT") : t("SIGNUP_BUTTON")}
      </Button>
    </>
  );
}
