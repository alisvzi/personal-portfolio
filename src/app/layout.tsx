import SideToolBars from "@/components/layout/SideToolBars";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://alisoveizi.dev"),
  title: {
    default: "Portfolio - Ali Soveizi",
    template: "%s | Ali Soveizi",
  },
  description:
    "Frontend Developer Portfolio - Building exceptional digital experiences with React, Next.js, and TypeScript",
  keywords: [
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Web Development",
    "JavaScript",
    "UI/UX",
    "Tailwind CSS",
    "Framer Motion",
    "Responsive Design",
  ],
  authors: [{ name: "Ali Soveizi" }],
  creator: "Ali Soveizi",
  publisher: "Ali Soveizi",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Portfolio - Ali Soveizi",
    description:
      "Frontend Developer Portfolio - Building exceptional digital experiences",
    type: "website",
    locale: "en_US",
    url: "https://alisoveizi.dev",
    siteName: "Ali Soveizi Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ali Soveizi - Frontend Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Soveizi - Frontend Developer",
    description:
      "Frontend Developer Portfolio - Building exceptional digital experiences with React, Next.js, and TypeScript",
    images: ["/og-image.jpg"],
    creator: "@alisoveizi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.YANDEX_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SideToolBars>{children}</SideToolBars>
      </body>
    </html>
  );
}
