import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";
import { SITE_SOCIAL_HREFS } from "@/lib/site-contact";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { id: "email" as const, label: t("LANDING_SOCIAL_EMAIL"), Icon: Mail },
  { id: "instagram" as const, label: t("LANDING_SOCIAL_INSTAGRAM"), Icon: Instagram },
  { id: "facebook" as const, label: t("LANDING_SOCIAL_FACEBOOK"), Icon: Facebook },
  { id: "x" as const, label: t("LANDING_SOCIAL_X"), Icon: Twitter },
  { id: "youtube" as const, label: t("LANDING_SOCIAL_YOUTUBE"), Icon: Youtube },
  { id: "linkedin" as const, label: t("LANDING_SOCIAL_LINKEDIN"), Icon: Linkedin },
];

export function FooterSocialLinks({ className }: { className?: string }) {
  const visible = items.filter(({ id }) => SITE_SOCIAL_HREFS[id]?.trim());

  if (visible.length === 0) return null;

  return (
    <div className={cn("mt-8 border-t border-white/10 pt-6", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/55">
        {t("LANDING_FOLLOW_US")}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2.5" role="list">
        {visible.map(({ id, label, Icon }) => {
          const href = SITE_SOCIAL_HREFS[id];
          return (
            <li key={id}>
              <a
                href={href}
                target={id === "email" ? undefined : "_blank"}
                rel={id === "email" ? undefined : "noopener noreferrer"}
                aria-label={label}
                className={cn(
                  "group flex h-11 w-11 items-center justify-center rounded-xl",
                  "border border-white/15 bg-white/[0.08] text-primary-foreground/90",
                  "shadow-sm shadow-black/10 backdrop-blur-sm",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.18] hover:text-white hover:shadow-md hover:shadow-black/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                )}
              >
                <Icon
                  className="h-[1.125rem] w-[1.125rem] transition-transform duration-200 group-hover:scale-110"
                  aria-hidden
                  strokeWidth={2}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
