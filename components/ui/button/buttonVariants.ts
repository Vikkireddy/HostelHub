import { cva, type VariantProps } from "class-variance-authority";

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export const buttonVariants = cva(baseStyles, {
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground hover:bg-primary-500 focus-visible:ring-primary",
      destructive:
        "bg-red-600 text-primary-foreground hover:bg-red-700 focus-visible:ring-red-500",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-link underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2 [&_svg]:size-4",
      sm: "h-9 rounded-md px-3 [&_svg]:size-3.5",
      lg: "h-11 rounded-md px-8 [&_svg]:size-5",
      icon: "h-10 w-10 [&_svg]:size-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
