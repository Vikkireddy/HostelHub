import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Admin HostelHub — phone, WhatsApp, or send us a message.",
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
