import { cn } from "@/lib/utils";

/** Brand mark from `public/img/AhhLogo.svg` (vector file; too large to inline as JSX). */
export function LandingLogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/img/AhhLogo.svg"
      alt=""
      width={1536}
      height={1024}
      decoding="async"
      className={cn(
        "h-[3.375rem] w-auto max-h-[3.375rem] max-w-[min(100%,288px)] object-contain object-left sm:h-[3.625rem] sm:max-h-[3.625rem] sm:max-w-[min(100%,360px)]",
        className
      )}
    />
  );
}
