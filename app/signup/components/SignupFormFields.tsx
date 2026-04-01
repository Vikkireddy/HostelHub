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
          {index === 2 && <Divider sx={{ my: 2, borderColor: "rgba(148, 163, 184, 0.22)" }} />}
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

      <Typography variant="caption" color="rgba(148, 163, 184, 0.95)" sx={{ display: "block", mb: 2 }}>
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
                  "&.Mui-checked": { color: "#60a5fa" },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "rgba(226, 232, 240, 0.9)" }}>
                {t("SIGNUP_ACCEPT_TERMS")}
              </Typography>
            }
            sx={{ mb: 3 }}
          />
        )}
      />
      {errors.acceptTerms && (
        <Typography variant="caption" sx={{ color: "#fca5a5", display: "block", mb: 2 }}>
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
          bgcolor: "#3b82f6",
          "&:hover": { bgcolor: "#2563eb" },
          py: 1.5,
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        {isSubmitting ? t("SIGNUP_CREATING_ACCOUNT") : "Create Account"}
      </Button>
    </>
  );
}
