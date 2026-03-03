"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label for required form fields. Renders a red asterisk after the label text.
 * Use consistently across the app for all mandatory fields.
 */
const RequiredLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, children, ...props }, ref) => (
  <Label ref={ref} className={cn(className)} {...props}>
    {children}
    <span className="text-red-500 ml-0.5" aria-hidden="true">
      *
    </span>
  </Label>
));
RequiredLabel.displayName = "RequiredLabel";

export { RequiredLabel };
