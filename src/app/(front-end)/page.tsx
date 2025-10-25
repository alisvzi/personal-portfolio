import { Suspense } from "react";

import { Metadata } from "next";

import Portfolio from "@/components/Portfolio";
import { FullScreenLoading } from "@/components/ui/LoadingSpinner";
import { PERSON_SCHEMA, SEO_CONFIG } from "@/lib/constants";
import { ensureAdmin } from "@/lib/utils/seedAdmin";

export const metadata: Metadata = {
  title: SEO_CONFIG.defaultTitle,
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: SEO_CONFIG.author }],
  openGraph: {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.description,
    type: "website",
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.defaultTitle,
    images: [
      {
        url: SEO_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.description,
    images: [SEO_CONFIG.ogImage],
    creator: `@${SEO_CONFIG.author.toLowerCase().replace(" ", "")}`,
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
  },
};

export default async function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ali Soveizi - Frontend Developer Portfolio",
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.siteUrl,
    mainEntity: PERSON_SCHEMA,
    breadcrumbList: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SEO_CONFIG.siteUrl,
        },
      ],
    },
  };

  await ensureAdmin();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Suspense
          fallback={<FullScreenLoading message="Loading portfolio..." />}
        >
          <Portfolio />
        </Suspense>
      </main>
    </>
  );
}
