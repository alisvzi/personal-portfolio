import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { Suspense } from "react";

import "../globals.css";

import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import RouteProgress from "@/components/layout/RouteProgress";
import {
  type Locale,
  directionOf,
  htmlLang,
  isLocale,
  locales,
  openGraphLocale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { siteUrl } from "@/lib/env";
import { canonicalFor, localeAlternates, ogImageUrl } from "@/lib/seo";

/**
 * Root layout.
 *
 * It lives inside `[locale]` rather than at the `app/` root so that `<html>`
 * can carry the correct `lang` and `dir` for every page. This is the Next.js
 * i18n convention and the only way to avoid a hardcoded, wrong direction on
 * the server-rendered document.
 */

/**
 * Latin typeface.
 *
 * Geist is free (SIL OFL), self-hosted by `next/font` at build time, and its
 * Latin is far more refined than a pan-script family's. It is the *first*
 * choice for Latin text; Vazirmatn sits behind it in the stack so a stray
 * Persian glyph inside an English sentence still shapes correctly.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

/**
 * Monospace: labels, code, meta.
 *
 * Geist Mono covers Latin only, so Vazirmatn is appended to the same stack —
 * a Persian label set in `font-mono` then falls through per-glyph to a font
 * that actually has the script, instead of to the browser's default serif.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Persian typeface — Vazirmatn, free under the SIL OFL.
 *
 * It is the reference open-source Persian family: correct Arabic-script
 * shaping and joining, a complete Persian numeral set, and a matching Latin
 * companion so mixed Persian/English copy (the norm for developers) stays on
 * one rhythm. `subsets` includes both scripts for exactly that reason.
 *
 * `display: "swap"` matters more here than for Latin: a FOIT on Persian text
 * means invisible letterforms, and Persian is the default locale.
 */
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Viewport + browser chrome.
 *
 * `themeColor` matches `--bg`, so mobile Safari/Chrome paint the address bar in
 * the page colour instead of white — the site is dark-only, hence the fixed
 * `colorScheme`. `viewportFit: "cover"` lets the layout reach under the notch
 * on notched devices (the safe-area insets are handled in CSS).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1220",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);
  const base = siteUrl();
  const canonical = canonicalFor(locale);
  // Optional: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the token from
  // Search Console and the meta tag is emitted automatically.
  const googleVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(base),
    title: {
      default: dict.meta.homeTitle,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.homeDescription,
    keywords: dict.meta.keywords,
    authors: [{ name: dict.meta.siteName, url: base }],
    creator: dict.meta.siteName,
    publisher: dict.meta.siteName,
    applicationName: dict.meta.siteName,
    alternates: {
      canonical,
      languages: localeAlternates().languages,
    },
    ...(googleVerification
      ? { verification: { google: googleVerification } }
      : {}),
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      url: canonical,
      locale: openGraphLocale[locale],
      alternateLocale:
        locale === "fa" ? [openGraphLocale.en] : [openGraphLocale.fa],
      /*
       * Declared explicitly rather than left to the file convention so the
       * `alt` text can be localised. Screen readers and social crawlers both
       * read it, and a Persian page advertising itself with a Latin-only alt
       * is a small but real accessibility miss.
       */
      images: [
        {
          url: ogImageUrl(locale),
          width: 1200,
          height: 630,
          alt: dict.meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      images: [ogImageUrl(locale)],
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
    icons: {
      icon: "/favicon.ico",
      // Declared explicitly: setting `icons` replaces the file-convention
      // `apple-icon`, and without this link iOS falls back to requesting
      // `/apple-touch-icon.png`, which does not exist.
      apple: `/${locale}/apple-icon`,
    },
    manifest: "/manifest.webmanifest",
    category: "technology",
    // Safari auto-links anything that looks like a phone number or address,
    // wrapping it in a link that breaks the copy's styling. The contact details
    // are already real `mailto:`/`tel:` links, so detection is pure downside.
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    appleWebApp: {
      capable: true,
      title: dict.meta.siteName,
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  // An unknown first segment (`/foo`) must 404 rather than silently render the
  // default locale, which would create duplicate content at infinitely many
  // URLs.
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const dict = getDictionary(locale);

  return (
    <html
      lang={htmlLang[locale]}
      dir={directionOf(locale)}
      data-locale={locale}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased bg-background text-foreground`}
      >
        {/*
          The switcher reads `useSearchParams`, so it sits behind a Suspense
          boundary. It lives in the locale layout rather than the public site
          group so that the admin dashboard can be switched to the other
          language too.
        */}
        <Suspense fallback={null}>
          <LanguageSwitcher locale={locale} labels={dict.language} />
        </Suspense>
        {/*
          Route-level feedback for every navigation. Server-rendered pages read
          MongoDB on each request, so without this a click on a project card
          would look like it did nothing until the new page painted.
        */}
        <RouteProgress label={dict.states.loading} />
        {children}
      </body>
    </html>
  );
}
