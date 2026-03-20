"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariantProps } from "./buttonVariants";

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  asChild?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      startAdornment,
      endAdornment,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {startAdornment}
        {children}
        {endAdornment}
      </Comp>
    );
  }
);
BaseButton.displayName = "BaseButton";

export { BaseButton };
