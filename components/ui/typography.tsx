import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      default: "",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-muted-foreground text-xl",
      muted: "text-muted-foreground text-sm",
      small: "text-sm leading-none font-medium",
      large: "text-lg font-semibold",
      error: "rounded-md bg-red-50 px-3 py-2 text-sm text-red-600",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      caption: "text-xs text-slate-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: "p" | "span" | "div" | "small";
}

const Typography = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant, asChild = false, as: Tag = "p", ...props }, ref) => {
    const Comp = asChild ? Slot : Tag;
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
