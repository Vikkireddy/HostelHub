"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseButton } from "./BaseButton";
import type { ButtonVariantProps } from "./buttonVariants";

export interface AppButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ButtonVariantProps {
  asChild?: boolean;
  /** Icon shown before the label */
  icon?: React.ReactNode;
  /** Icon shown after the label */
  iconEnd?: React.ReactNode;
  /** When true, shows a spinner and disables the button */
  loading?: boolean;
}

const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      icon,
      iconEnd,
      loading = false,
      disabled,
      children,
      variant,
      size = "default",
      asChild,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const spinner = (
      <Loader2
        className={cn("animate-spin", size === "sm" && "size-3.5", size === "lg" && "size-5")}
        aria-hidden
      />
    );

    const startAdornment = loading ? spinner : icon;
    const endAdornment = loading ? null : iconEnd;

    return (
      <BaseButton
        ref={ref}
        variant={variant}
        size={size}
        asChild={asChild}
        disabled={isDisabled}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        className={className}
        aria-busy={loading}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);
AppButton.displayName = "AppButton";

export { AppButton };
