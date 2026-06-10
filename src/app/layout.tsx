import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "ProspectPilot Local — Audits SEO locaux et propositions commerciales en marque blanche",
    template: "%s — ProspectPilot Local",
  },
  description:
    "Le logiciel des agences web, freelances et consultants SEO : générez en quelques minutes un audit digital local, une stratégie SEO, un simulateur de ROI et une proposition commerciale prête à signer, en marque blanche.",
  keywords: [
    "outil audit SEO local",
    "audit digital local",
    "logiciel audit prospect",
    "outil agence web",
    "outil marque blanche agence SEO",
    "générateur rapport SEO",
    "logiciel prospection agence web",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "ProspectPilot Local",
    title: "ProspectPilot Local — L'audit prospect qui fait signer",
    description:
      "Générez en quelques minutes un audit digital local complet et une proposition commerciale en marque blanche. Pour agences web, freelances et consultants SEO.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProspectPilot Local — L'audit prospect qui fait signer",
    description:
      "Audit digital local, stratégie SEO, ROI et proposition commerciale en marque blanche, générés en quelques minutes.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
