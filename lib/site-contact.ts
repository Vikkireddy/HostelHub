/** Production site origin (canonical URLs, SEO). */
export const SITE_ORIGIN = "https://adminhostelhub.com" as const;

/** Public contact details (landing footer, contact page). */
export const SITE_CONTACT = {
  inquiryEmail: "adminhostelhub@gmail.com",
  addressLines: ["Hyderabad, Meerpet", "Telangana","India", "500097"],
  phoneDisplay: "+91 83410 85440",
  phoneTel: "+918341085440",
  whatsappDisplay: "+91 83410 85440",
  whatsappE164: "918341085440",
} as const;

export const SITE_SOCIAL_HREFS: Record<
  "email" | "instagram" | "facebook" | "x" | "youtube" | "linkedin",
  string
> = {
  email: `mailto:${SITE_CONTACT.inquiryEmail}`,
  instagram: "https://www.instagram.com/adminhostelhub",
  facebook: "https://www.facebook.com/share/1GgohttkHq/",
  x: "",
  youtube: "",
  linkedin: "",
};
