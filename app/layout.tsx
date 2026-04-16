import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://adminhostelhub.com"),
  title: "Admin Hostel Hub - Hostel Management Software in India",
  description:
    "Best hostel management software in India. Manage students, rent, payments, expenses, and room vacancy easily with Admin Hostel Hub.",
  keywords: [
    "hostel management software india",
    "pg management app india",
    "hostel rent tracking app",
    "hostel admin dashboard",
    "Admin Hostel Hub",
    "student hostel management",
  ],
  icons: {
    icon: [{ url: "/img/AhhLogo.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
