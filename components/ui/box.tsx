import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  as?: "div" | "span" | "section" | "article" | "main" | "header" | "footer" | "aside" | "nav";
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, asChild = false, as: Tag = "div", ...props }, ref) => {
    const Comp = asChild ? Slot : Tag;
    return <Comp ref={ref} className={cn(className)} {...props} />;
  }
);
Box.displayName = "Box";

export { Box };
